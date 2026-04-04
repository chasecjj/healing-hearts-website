/**
 * Async generator for cursor-paginated Supabase queries.
 * Yields one page (array of rows) per iteration.
 *
 * Usage:
 *   for await (const rows of paginatedQuery(() =>
 *     supabaseAdmin.from('table').select('id, email').eq('active', true)
 *   )) {
 *     // process rows (up to batchSize per iteration)
 *   }
 *
 * The buildQuery callback must return a fresh Supabase query builder each call
 * (without .order, .limit, or .gt — those are added internally).
 * The query MUST select `id` for cursor pagination.
 *
 * @param {Function} buildQuery - Returns a Supabase query builder.
 * @param {Object} [options]
 * @param {number} [options.batchSize=50] - Rows per page.
 * @yields {Array} One page of rows.
 */
export async function* paginatedQuery(buildQuery, { batchSize = 50 } = {}) {
  let lastId = null;

  while (true) {
    let query = buildQuery();
    query = query.order('id', { ascending: true }).limit(batchSize);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return;
    }

    lastId = data[data.length - 1].id;
    yield data;

    if (data.length < batchSize) {
      return;
    }
  }
}
