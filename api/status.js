export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const hasKey = !!process.env.ANTHROPIC_API_KEY
  const hasSupabase = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasResend = !!process.env.RESEND_API_KEY

  res.status(200).json({
    api_configured: hasKey,
    supabase_configured: hasSupabase,
    service_role_configured: hasServiceRole,
    resend_configured: hasResend,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
    platform: 'ORION Gestão Executiva',
    version: '15.0',
  })
}
