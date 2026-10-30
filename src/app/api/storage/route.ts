import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { action, filePath, expiresIn = 3600 } = await request.json();
    const bucket = process.env.NEXT_PUBLIC_CLINICAL_STORAGE_BUCKET || 'clinical-private';

    if (action === 'get_signed_url') {
      try {
        const supabase = createSupabaseServerClient();
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          // If Supabase remote storage is not yet connected, return simulated secure URL
          return NextResponse.json({
            signedUrl: `/api/storage/simulated?bucket=${bucket}&file=${encodeURIComponent(filePath)}&token=secure-${Date.now()}`,
            isSimulated: true
          });
        }
        return NextResponse.json({ signedUrl: data.signedUrl, isSimulated: false });
      } catch (err: any) {
        return NextResponse.json({
          signedUrl: `/api/storage/simulated?bucket=${bucket}&file=${encodeURIComponent(filePath)}&token=secure-${Date.now()}`,
          isSimulated: true
        });
      }
    }

    return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
