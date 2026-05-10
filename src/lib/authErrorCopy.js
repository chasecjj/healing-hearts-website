/**
 * Maps Supabase auth error codes/messages to trauma-informed copy.
 * Falls back to the original message if no mapping exists.
 */
export function errorCopyFor(err) {
  if (!err) return '';
  const msg = typeof err === 'string' ? err : err.message || err.toString();

  const map = [
    { match: /invalid login credentials/i, copy: "That didn't match what we have on file. Try again, or reset your password below." },
    { match: /email not confirmed/i, copy: "Almost there — check your email for the confirmation link we sent." },
    { match: /user already registered|already exists/i, copy: "Looks like you already have an account with this email. Try signing in instead." },
    { match: /password.*6 characters|password.*short/i, copy: "Let's make your password a bit longer — 8 characters or more." },
    { match: /rate limit|too many/i, copy: "Let's pause for a moment — you've tried a few times. Give it a minute, then try again." },
    { match: /invalid email|valid email/i, copy: "That email doesn't look quite right — can you double-check it?" },
    { match: /network|fetch failed/i, copy: "Connection hiccup. Your internet might be slow — try again in a moment." },
    { match: /auth session missing|session missing/i, copy: "This reset link has expired. Please request a new password reset link." },
  ];

  for (const entry of map) {
    if (entry.match.test(msg)) return entry.copy;
  }
  return msg; // fallback
}
