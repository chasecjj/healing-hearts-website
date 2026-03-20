// Vercel Serverless Function: POST /api/contact
// Receives contact form submissions from the Healing Hearts website.
// TODO: Wire up email sending via Resend once API key is configured.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message, phone, interest } = req.body || {};

  // Validate required fields
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required.');
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Message is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Sanitize inputs
  const sanitized = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    phone: phone ? String(phone).trim() : null,
    interest: interest ? String(interest).trim() : null,
    receivedAt: new Date().toISOString(),
  };

  // TODO: Send email via Resend
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Healing Hearts <noreply@healingheartscourse.com>',
  //   to: 'hello@healingheartscourse.com',
  //   subject: `New Contact: ${sanitized.name} — ${sanitized.interest || 'General'}`,
  //   text: `Name: ${sanitized.name}\nEmail: ${sanitized.email}\nPhone: ${sanitized.phone || 'N/A'}\nInterest: ${sanitized.interest || 'N/A'}\n\n${sanitized.message}`,
  // });

  console.log('[contact-form] Submission received:', sanitized);

  return res.status(200).json({
    success: true,
    message: 'Your message has been received. We will be in touch within 24 hours.',
  });
}
