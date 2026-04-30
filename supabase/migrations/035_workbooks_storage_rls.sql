-- 035_workbooks_storage_rls.sql
-- Storage RLS for the workbooks bucket.
--
-- Mirrors the existing 'downloads' bucket pattern: any authenticated user
-- can SELECT from the workbooks bucket. Course-enrollment gating happens
-- at the application layer (ModuleOverview.jsx only shows the download
-- button when the user has an active enrollment for the module's course),
-- backed by short-lived signed URLs (3600s).

CREATE POLICY workbooks_authenticated_read
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'workbooks');
