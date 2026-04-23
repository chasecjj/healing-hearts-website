// One-time broadcast: webinar-day morning invite to active SPARK subs.
// Scheduled 2026-04-23 14:30 UTC (08:30 MDT). Date-guarded to fire exactly once.

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (today !== '2026-04-23') {
    console.log(`[spark-broadcast-morning] Skipping — today is ${today}`);
    return res.status(200).json({ skipped: true, reason: 'date-guard', today });
  }

  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://healingheartscourse.com';

  try {
    const response = await fetch(`${base}/api/admin/send-broadcast`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template: 'webinar-broadcast-april23',
        audience: 'spark',
        dryRun: false,
      }),
    });

    const data = await response.json();
    console.log('[spark-broadcast-morning] result:', data);

    if (!response.ok) {
      return res.status(502).json({ error: 'send-broadcast failed', upstream: data });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('[spark-broadcast-morning] failed:', err);
    return res.status(500).json({ error: err.message });
  }
}
