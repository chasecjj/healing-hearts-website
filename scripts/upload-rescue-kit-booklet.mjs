// One-off: create the 'workbooks' Storage bucket if missing and upload the
// Rescue Kit booklet PDF at path 'rescue-kit/booklet.pdf'.
//
// Idempotent — re-running re-uploads (overwrite=true) and is safe if the
// bucket already exists.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const envRaw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const line of envRaw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) {
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[m[1]] = v;
  }
}

const PDF_PATH = process.argv[2];
if (!PDF_PATH) {
  console.error('Usage: node scripts/upload-rescue-kit-booklet.mjs <local-pdf-path>');
  process.exit(1);
}

const BUCKET = 'workbooks';
const STORAGE_PATH = 'rescue-kit/booklet.pdf';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: existing } = await supabase.storage.getBucket(BUCKET);
if (!existing) {
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 52428800,
    allowedMimeTypes: ['application/pdf'],
  });
  if (createErr) {
    console.error('createBucket error:', createErr);
    process.exit(1);
  }
  console.log(`Created bucket: ${BUCKET}`);
} else {
  console.log(`Bucket exists: ${BUCKET}`);
}

const buffer = readFileSync(PDF_PATH);
console.log(`Uploading ${PDF_PATH} (${buffer.length} bytes) -> ${BUCKET}/${STORAGE_PATH}`);

const { error: uploadErr } = await supabase.storage
  .from(BUCKET)
  .upload(STORAGE_PATH, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

if (uploadErr) {
  console.error('upload error:', uploadErr);
  process.exit(1);
}

const { data: signed } = await supabase.storage
  .from(BUCKET)
  .createSignedUrl(STORAGE_PATH, 60);

console.log('Upload OK.');
console.log('Signed URL preview (60s):', signed?.signedUrl);
