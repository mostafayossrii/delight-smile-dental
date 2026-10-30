-- Create private storage bucket for clinical records
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinical-private',
  'clinical-private',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom'];

-- Storage RLS on storage.objects for clinical-private
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Clinical Private: Staff full access'
  ) THEN
    CREATE POLICY "Clinical Private: Staff full access"
    ON storage.objects FOR ALL TO authenticated
    USING (
      bucket_id = 'clinical-private' AND (
        EXISTS (
          SELECT 1 FROM public.profile_roles pr
          JOIN public.roles r ON pr.role_id = r.id
          WHERE pr.profile_id = auth.uid() AND r.code IN ('admin', 'dentist', 'assistant', 'receptionist')
        )
      )
    )
    WITH CHECK (
      bucket_id = 'clinical-private' AND (
        EXISTS (
          SELECT 1 FROM public.profile_roles pr
          JOIN public.roles r ON pr.role_id = r.id
          WHERE pr.profile_id = auth.uid() AND r.code IN ('admin', 'dentist', 'assistant', 'receptionist')
        )
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Clinical Private: Patients view own documents'
  ) THEN
    CREATE POLICY "Clinical Private: Patients view own documents"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'clinical-private' AND (
        EXISTS (
          SELECT 1 FROM public.patient_user_links pul
          WHERE pul.profile_id = auth.uid()
            AND pul.is_verified = true
            AND (name LIKE pul.patient_id::text || '/%' OR name LIKE '%/' || pul.patient_id::text || '/%')
        )
      )
    );
  END IF;
END $$;
