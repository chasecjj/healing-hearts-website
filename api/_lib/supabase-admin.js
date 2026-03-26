/* global process */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  const missing = [!url && 'SUPABASE_URL', !key && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ');
  console.error(`[supabase-admin] FATAL: Missing environment variables: ${missing}`);

  if (process.env.VERCEL_ENV === 'production') {
    throw new Error(`[supabase-admin] Cannot start in production without: ${missing}`);
  }
}

export const supabaseAdmin = createClient(url || '', key || '');
