import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/admin/upload
 * Handles profile image and document uploads with validation and storage persistence.
 * Guarded by AuthServerService.isAdmin().
 */
export async function POST(request: Request) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawBucket = (formData.get('bucket') as string) || 'portfolio-images';
    const ALLOWED_BUCKETS = ['portfolio-images', 'portfolio-documents', 'portfolio-media'];
    const bucket = ALLOWED_BUCKETS.includes(rawBucket) ? rawBucket : 'portfolio-images';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in the upload request.' },
        { status: 400 }
      );
    }

    const isDocument = bucket === 'portfolio-documents' || file.type === 'application/pdf';
    const allowedTypes = isDocument ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isDocument ? MAX_DOC_SIZE : MAX_IMAGE_SIZE;

    // 1. Validate MIME type
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type (${file.type}). Allowed formats: ${allowedTypes.join(
            ', '
          )}`,
        },
        { status: 400 }
      );
    }

    // 2. Validate File Size
    if (file.size > maxSize) {
      const maxMb = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File size exceeds the limit of ${maxMb}MB. Please compress your file.` },
        { status: 400 }
      );
    }

    const rawBytes = await file.arrayBuffer();
    const buffer = Buffer.from(rawBytes);

    const timestamp = Date.now();
    const cleanBase = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, '_').replace(/^\.+/, '');
    const safeBaseName = cleanBase || 'file';
    const storagePath = `${timestamp}-${safeBaseName}`;

    let publicUrl = '';
    let usedFallback = false;

    // 3. Attempt Supabase Storage Upload if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = await createClient();
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
          publicUrl = urlData.publicUrl;
        } else {
          console.warn('[Storage Upload] Cloud upload error, triggering local fallback:', uploadError.message);
          usedFallback = true;
        }
      } catch (cloudErr) {
        console.warn('[Storage Upload] Cloud storage exception:', cloudErr);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    // 4. Resilient Local Fallback (for development / unconfigured cloud storage)
    if (usedFallback || !publicUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const localFilePath = path.join(uploadsDir, storagePath);
      fs.writeFileSync(localFilePath, buffer);
      publicUrl = `/uploads/${storagePath}`;
    }

    // 5. Register Media Metadata in PostgreSQL and local store
    let registeredMedia = null;
    try {
      registeredMedia = await AdminService.registerMedia({
        title: file.name,
        file_name: storagePath,
        storage_path: storagePath,
        public_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        media_type: isDocument ? 'document' : 'image',
        alt_text: isDocument ? 'Resume Document' : 'Uploaded Image',
      });
    } catch (err) {
      console.warn('[Upload Metadata] Registration notice:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully.',
      url: publicUrl,
      fileName: storagePath,
      fileSize: file.size,
      mimeType: file.type,
      media: registeredMedia,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'File upload failed';
    console.error('[POST /api/admin/upload] Exception:', errorMsg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the file upload.' },
      { status: 500 }
    );
  }
}
