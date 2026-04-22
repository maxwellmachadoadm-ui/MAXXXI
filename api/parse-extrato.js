// api/parse-extrato.js — Vercel Function (Ciclo 11 — Extratos IA Fase 2)
// Extrai transações estruturadas de texto bruto (PDF/Excel/CSV) via Claude Haiku 4.5
// Input:  { texto: string, tipo: 'pdf'|'xlsx'|'csv', origem?: string }
// Output: { transacoes: [{ data, descricao, valor, tipo }], usage, model }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { texto, tipo, origem } = req.body || {};
  if (!texto || typeof texto !== 'string' || texto.length < 10) {
    return res.status(400).json({ error: 'texto inválido ou muito curto' });
  }
  if (texto.length > 80000) {
    return res.status(413).json({ error: 'texto muito grande (>80k chars). Divida o extrato em partes menores.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const tipoLabel = tipo === 'pdf' ? 'PDF' : tipo === 'xlsx' || tipo === 'xls' ? 'Excel' : 'CSV';

  const prompt = `Extraia todas as transações bancárias do extrato abaixo (formato ${tipoLabel}).

Retorne APENAS um JSON array válido (sem markdown, sem texto extra) no formato exato:
[{"data":"YYYY-MM-DD","descricao":"string","valor":number,"tipo":"credito"|"debito"}]

Regras obrigatórias:
- Valor SEMPRE positivo. O sinal é indicado pelo campo "tipo".
- "credito" = entrada/receita no extrato (depósito, PIX recebido, TED recebido, crédito).
- "debito" = saída/despesa (débito, PIX enviado, pagamento, compra, tarifa, saque).
- Data em formato ISO YYYY-MM-DD. Se a data vier como dd/mm/aaaa, converta.
- IGNORE: cabeçalhos, rodapés, saldos (anterior, atual, disponível), totais, subtotais, linhas informativas.
- IGNORE também transações com valor zero.
- Descrição: copie exatamente como está no extrato (sem truncar, sem reformatar).
- Se não encontrar transações, retorne [].

Extrato (${tipoLabel}, ${origem || 'origem não identificada'}):
"""
${texto}
"""`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'Anthropic API error', detail: errText.slice(0, 500) });
    }

    const data = await response.json();
    const textContent = data.content?.[0]?.text || '[]';

    let transacoes = [];
    try {
      const cleaned = textContent.replace(/```json|```/g, '').trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) transacoes = JSON.parse(match[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Parse JSON error', raw: textContent.slice(0, 300) });
    }

    // Sanitiza e valida cada transação (defesa em profundidade)
    const valid = transacoes
      .filter(t => t && typeof t === 'object')
      .map(t => ({
        data: typeof t.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.data) ? t.data : '',
        descricao: typeof t.descricao === 'string' ? t.descricao.trim().slice(0, 500) : '',
        valor: Math.abs(Number(t.valor) || 0),
        tipo: t.tipo === 'credito' || t.tipo === 'debito' ? t.tipo : (Number(t.valor) >= 0 ? 'credito' : 'debito')
      }))
      .filter(t => t.data && t.descricao && t.valor > 0);

    return res.status(200).json({
      transacoes: valid,
      total_extraido: transacoes.length,
      total_valido: valid.length,
      usage: data.usage,
      model: data.model
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal error' });
  }
}
