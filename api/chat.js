import { createClient } from '@supabase/supabase-js'

const MODEL_ALIASES = {
  'claude-haiku-4-5':          'claude-3-5-haiku-20241022',
  'claude-3-5-haiku':          'claude-3-5-haiku-20241022',
  'claude-sonnet-4-5':         'claude-sonnet-4-5',
  'claude-sonnet-4-6':         'claude-sonnet-4-5',
  'claude-opus-4-5':           'claude-opus-4-5',
}
const DEFAULT_MODEL = 'claude-3-5-haiku-20241022'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' })

  const { model, max_tokens, system, messages, empresa_id, empresa_nome, contexto } = req.body || {}
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Campo "messages" ausente ou inválido' })
  }

  // ── Buscar dados reais do Supabase para contexto ──
  let dadosContexto = ''
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    const supabase = createClient(supabaseUrl, serviceKey)
    try {
      const d90 = new Date(Date.now() - 90 * 86400000).toISOString()
      if (empresa_id === 'of') {
        const [proj, lanc, parc] = await Promise.all([
          supabase.from('of_projetos').select('*').limit(20),
          supabase.from('of_lancamentos').select('*').gte('created_at', d90).limit(100),
          supabase.from('of_parcelas').select('*').in('status', ['aberto']).limit(50),
        ])
        dadosContexto = `\nDADOS ORIGINAL FOTOGRAFIA:\nProjetos: ${JSON.stringify(proj.data || [])}\nLançamentos: ${JSON.stringify(lanc.data || [])}\nParcelas abertas: ${JSON.stringify(parc.data || [])}`
      } else if (empresa_id === 'fs') {
        const [lanc, comp, tar] = await Promise.all([
          supabase.from('lancamentos').select('*').eq('empresa_id', 'fs').gte('created_at', d90).limit(50),
          supabase.from('compromissos').select('*').eq('empresa_id', 'fs').limit(20),
          supabase.from('tarefas').select('*').eq('empresa_id', 'fs').neq('status', 'done').limit(20),
        ])
        dadosContexto = `\nDADOS FORME SEGURO:\nLançamentos: ${JSON.stringify(lanc.data || [])}\nCompromissos: ${JSON.stringify(comp.data || [])}\nTarefas: ${JSON.stringify(tar.data || [])}`
      } else if (empresa_id === 'gp') {
        const [trans, regras, comp] = await Promise.all([
          supabase.from('transacoes').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('regras_classificacao').select('*').limit(50),
          supabase.from('compromissos').select('*').eq('empresa_id', 'gp').limit(20),
        ])
        dadosContexto = `\nDADOS GESTÃO PESSOAL:\nTransações: ${JSON.stringify(trans.data || [])}\nRegras aprendidas: ${JSON.stringify(regras.data || [])}\nCompromissos: ${JSON.stringify(comp.data || [])}`
      }
    } catch (e) { dadosContexto = '\nDados do Supabase indisponíveis.' }
  }

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const systemPrompt = system || `Você é MAXXXI, agente executivo de inteligência do ORION Gestão Executiva.
Parceiro estratégico de Maxwell — CEO, Contador, Presidente CDL ITAPERUNA.

DATA: ${hoje}
EMPRESA ATIVA: ${empresa_nome || 'Visão Geral'}
${dadosContexto}
${contexto ? `CONTEXTO ADICIONAL: ${contexto}` : ''}

CAPACIDADES:
- Analisar dados financeiros reais e gerar insights precisos
- Calcular margens, ticket médio, inadimplência e fluxo de caixa
- Identificar riscos e oportunidades com base nos números
- Sugerir ações concretas e priorizadas
- Redigir comunicados, cobranças e relatórios

REGRAS:
1. Nunca invente números — use apenas dados reais disponíveis
2. Se faltar dado, diga claramente
3. Seja direto e executivo — respostas curtas e acionáveis
4. Use R$ com separador de milhar brasileiro
5. 🔴 problema crítico | 🟡 atenção | 🚀 oportunidade | ✅ positivo
6. Sempre termine com uma ação concreta quando relevante
7. Máximo 400 palavras salvo quando análise completa for solicitada`

  const resolvedModel = MODEL_ALIASES[model] || (model?.startsWith('claude-') ? model : DEFAULT_MODEL)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: resolvedModel,
        max_tokens: max_tokens || 1500,
        system: systemPrompt,
        messages,
      })
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(response.status).json({ error: `API Claude: ${err.slice(0, 200)}` })
    }

    const data = await response.json()

    // Salvar conversa no Supabase
    if (supabaseUrl && serviceKey && empresa_id) {
      try {
        const supabase = createClient(supabaseUrl, serviceKey)
        const lastMsg = messages[messages.length - 1]
        await supabase.from('maxxxi_conversas').insert([
          { empresa_id, role: lastMsg.role, content: lastMsg.content },
          { empresa_id, role: 'assistant', content: data.content?.[0]?.text || '' }
        ])
      } catch (_) {}
    }

    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Erro interno' })
  }
}
