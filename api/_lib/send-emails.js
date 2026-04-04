/**
 * Send email payloads in chunks via Resend batch API.
 *
 * Handles chunking (Resend limits batch.send to 100 emails) and error isolation
 * per chunk. An optional onChunkSent callback fires after each successful chunk,
 * receiving the start index and count so callers can update their own records.
 *
 * @param {import('resend').Resend} resend - Resend client instance.
 * @param {Array<{ from: string, to: string, subject: string, html: string }>} payloads
 * @param {Object} [options]
 * @param {number} [options.chunkSize=100] - Max emails per batch.send call.
 * @param {(startIdx: number, count: number) => Promise<void>} [options.onChunkSent]
 *   Called after a chunk sends successfully. startIdx is the index into the original
 *   payloads array; count is the number of emails in the chunk.
 * @returns {Promise<{ sent: number, errors: Array<{ email: string, error: string }> }>}
 */
export async function sendBatch(resend, payloads, { chunkSize = 100, onChunkSent } = {}) {
  const results = { sent: 0, errors: [] };

  for (let i = 0; i < payloads.length; i += chunkSize) {
    const chunk = payloads.slice(i, i + chunkSize);

    try {
      const { error: batchError } = await resend.batch.send(chunk);

      if (batchError) {
        console.error('[send-emails] Batch send error:', batchError);
        for (const p of chunk) {
          results.errors.push({ email: p.to, error: batchError.message });
        }
        continue;
      }

      results.sent += chunk.length;

      if (onChunkSent) {
        await onChunkSent(i, chunk.length);
      }
    } catch (err) {
      console.error('[send-emails] Batch send threw:', err);
      for (const p of chunk) {
        results.errors.push({ email: p.to, error: err.message });
      }
    }
  }

  return results;
}
