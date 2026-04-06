export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, role } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  // In a production setup, this would send an email via a service like Resend, SendGrid, etc.
  // For now, just log and return success
  console.log(`ORION invite: ${email} as ${role || 'viewer'}`)

  return res.status(200).json({
    success: true,
    message: `Invite sent to ${email}`,
    note: 'Configure an email service (Resend, SendGrid) for real email delivery'
  })
}
