// api/weekly-report.js
// Vercel Cron Job — todo domingo às 20h (Horário de Brasília = 23h UTC)
// Envio de relatório executivo semanal via Resend

export const config = {
  schedule: '0 23 * * 0', // Todo domingo 23h UTC (20h BRT)
}

export default async function handler(req, res) {
  // Verificação de segurança para cron jobs
  const authHeader = req.headers['authorization']
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const TO_EMAIL = process.env.RESEND_TO_EMAIL || process.env.REPORT_EMAIL || 'maxwell@orion.app'

  if (!RESEND_API_KEY) {
    console.log('[ORION Weekly Report] RESEND_API_KEY não configurado — modo simulação')
    return res.status(200).json({ ok: true, simulated: true, message: 'Relatório simulado (sem RESEND_API_KEY)' })
  }

  const dataAtual = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ORION — Relatório Executivo Semanal</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; color: #1e293b; }
  .wrapper { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
  .header { background: linear-gradient(135deg, #060f26 0%, #0c1e52 60%, #162d8c 100%); border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px; }
  .logo-text { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #fff; margin-bottom: 4px; }
  .logo-sub { font-size: 11px; letter-spacing: 3px; color: #93c5fd; text-transform: uppercase; }
  .header-title { font-size: 18px; color: #bfdbfe; margin-top: 16px; font-weight: 300; }
  .header-date { font-size: 13px; color: #64748b; margin-top: 4px; }
  .section { background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
  .emp-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
  .emp-row:last-child { border-bottom: none; }
  .emp-badge { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; color: #fff; flex-shrink: 0; }
  .emp-info { flex: 1; }
  .emp-name { font-size: 14px; font-weight: 600; color: #1e293b; }
  .emp-stats { font-size: 12px; color: #64748b; margin-top: 2px; }
  .score-badge { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
  .score-green { background: #dcfce7; color: #16a34a; }
  .score-yellow { background: #fef9c3; color: #ca8a04; }
  .score-red { background: #fee2e2; color: #dc2626; }
  .alert-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; }
  .alert-critico { background: #fef2f2; border-left: 3px solid #ef4444; }
  .alert-atencao { background: #fffbeb; border-left: 3px solid #f59e0b; }
  .alert-text { font-size: 13px; color: #374151; }
  .priority-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  .priority-num { width: 24px; height: 24px; border-radius: 50%; background: #1d4ed8; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .priority-text { font-size: 13px; color: #374151; }
  .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
  .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .kpi-card { background: #f8fafc; border-radius: 8px; padding: 14px; text-align: center; }
  .kpi-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
  .kpi-value { font-size: 22px; font-weight: 900; color: #1e293b; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo-text">ORION</div>
    <div class="logo-sub">Gestão Executiva</div>
    <div class="header-title">Relatório Executivo Semanal</div>
    <div class="header-date">${dataAtual}</div>
  </div>

  <div class="section">
    <div class="section-title">Resumo do Ecossistema</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Faturamento Total</div>
        <div class="kpi-value" style="color:#3b82f6">R$ 126k</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Resultado Líquido</div>
        <div class="kpi-value" style="color:#10b981">R$ 46,7k</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Health Score Médio</div>
        <div class="kpi-value" style="color:#a78bfa">72</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Alertas Ativos</div>
        <div class="kpi-value" style="color:#ef4444">3</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Performance por Empresa</div>
    <div class="emp-row">
      <div class="emp-badge" style="background:#3b82f6">DW</div>
      <div class="emp-info">
        <div class="emp-name">Doctor Wealth</div>
        <div class="emp-stats">R$ 48,5k · Margem 45% · Meta 81%</div>
      </div>
      <span class="score-badge score-green">Score 80</span>
    </div>
    <div class="emp-row">
      <div class="emp-badge" style="background:#f59e0b">OF</div>
      <div class="emp-info">
        <div class="emp-name">Original Fotografia</div>
        <div class="emp-stats">R$ 28k · Margem 15% · Inadim. 8,7%</div>
      </div>
      <span class="score-badge score-red">Score 52</span>
    </div>
    <div class="emp-row">
      <div class="emp-badge" style="background:#8b5cf6">FS</div>
      <div class="emp-info">
        <div class="emp-name">Forme Seguro</div>
        <div class="emp-stats">R$ 15k · 3 fundos ativos · Pipeline 5</div>
      </div>
      <span class="score-badge score-yellow">Score 65</span>
    </div>
    <div class="emp-row">
      <div class="emp-badge" style="background:#10b981">CDL</div>
      <div class="emp-info">
        <div class="emp-name">CDL ITAPERUNA</div>
        <div class="emp-stats">R$ 35k · 1.100 associados · Adim. 97,9%</div>
      </div>
      <span class="score-badge score-green">Score 88</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Alertas Críticos</div>
    <div class="alert-item alert-critico">
      <span>🔴</span>
      <span class="alert-text">Original Fotografia — Inadimplência em 8,7% (limite: 5%)</span>
    </div>
    <div class="alert-item alert-atencao">
      <span>🟡</span>
      <span class="alert-text">Forme Seguro — Meta mensal em 30% — acompanhar crescimento</span>
    </div>
    <div class="alert-item alert-atencao">
      <span>🟡</span>
      <span class="alert-text">Doctor Wealth — 3 tarefas de alta prioridade pendentes</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Top 3 Prioridades da Próxima Semana</div>
    <div class="priority-item">
      <div class="priority-num">1</div>
      <div class="priority-text"><strong>Reduzir inadimplência da OF</strong> — Ação de cobrança imediata nos contratos em atraso.</div>
    </div>
    <div class="priority-item">
      <div class="priority-num">2</div>
      <div class="priority-text"><strong>Fechar 2 novas turmas no FS</strong> — Há 3 leads em negociação avançada.</div>
    </div>
    <div class="priority-item">
      <div class="priority-num">3</div>
      <div class="priority-text"><strong>Revisão de metas Doctor Wealth</strong> — Analisar pipeline de novos médicos clientes.</div>
    </div>
  </div>

  <div style="text-align:center;margin:24px 0">
    <a href="https://orion-platform-wine.vercel.app" class="cta-btn">Abrir Plataforma ORION →</a>
  </div>

  <div class="footer">
    ORION Gestão Executiva · Gerado automaticamente pelo MAXXXI<br>
    Este é um email automático. Não responda.
  </div>
</div>
</body>
</html>`

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ORION <relatorio@orion-app.com>',
        to: [TO_EMAIL],
        subject: `📊 ORION — Relatório Executivo Semanal — ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend error: ${error}`)
    }

    const data = await response.json()
    console.log('[ORION Weekly Report] Email enviado:', data.id)
    return res.status(200).json({ ok: true, emailId: data.id })
  } catch (error) {
    console.error('[ORION Weekly Report] Erro:', error.message)
    return res.status(500).json({ error: error.message })
  }
}
