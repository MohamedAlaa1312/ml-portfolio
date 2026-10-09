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
    const rawBucket = (formData.get('bucket') as string) || 'portfolio-images';
    const ALLOWED_BUCKETS = ['portfolio-images', 'portfolio-documents', 'portfolio-media'];
    const bucket = ALLOWED_BUCKETS.includes(rawBucket) ? rawBucket : 'portfolio-images';

    // Collect all uploaded files from form data ('files' or 'file' keys)
    const rawFiles: (File | FormDataEntryValue)[] = [
      ...formData.getAll('files'),
      ...formData.getAll('file'),
    ];

    const files: File[] = rawFiles.filter(
      (item): item is File =>
        Boolean(item) &&
        typeof item === 'object' &&
        'arrayBuffer' in item &&
        typeof (item as File).size === 'number' &&
        (item as File).size > 0
    );

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided in the upload request.' },
        { status: 400 }
      );
    }

    const processedResults: Array<{
      url: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      media?: any;
    }> = [];

    // Initialize Supabase client once if configured
    let supabaseClient: any = null;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        supabaseClient = await createClient();
      } catch (e) {
        console.warn('[Storage Upload] Could not create Supabase client:', e);
      }
    }

    for (const file of files) {
      const isDocument = bucket === 'portfolio-documents' || file.type === 'application/pdf';
      const allowedTypes = isDocument ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
      const maxSize = isDocument ? MAX_DOC_SIZE : MAX_IMAGE_SIZE;

      // 1. Validate MIME type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type (${file.type}) for ${file.name}. Allowed formats: ${allowedTypes.join(
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
          { error: `File ${file.name} exceeds the limit of ${maxMb}MB. Please compress your file.` },
          { status: 400 }
        );
      }

      const rawBytes = await file.arrayBuffer();
      const buffer = Buffer.from(rawBytes);

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const cleanBase = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, '_').replace(/^\.+/, '');
      const safeBaseName = cleanBase || 'file';
      const storagePath = `${timestamp}-${randomSuffix}-${safeBaseName}`;

      let publicUrl = '';
      let usedFallback = false;

      // 3. Attempt Supabase Storage Upload if configured
      if (supabaseClient) {
        try {
          const { error: uploadError } = await supabaseClient.storage
            .from(bucket)
            .upload(storagePath, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (!uploadError) {
            const { data: urlData } = supabaseClient.storage.from(bucket).getPublicUrl(storagePath);
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
          alt_text: isDocument ? 'Document' : 'Uploaded Image',
        });
      } catch (err) {
        console.warn('[Upload Metadata] Registration notice:', err);
      }

      processedResults.push({
        url: publicUrl,
        fileName: storagePath,
        fileSize: file.size,
        mimeType: file.type,
        media: registeredMedia,
      });
    }

    const first = processedResults[0];

    return NextResponse.json({
      success: true,
      message: `${processedResults.length} file(s) uploaded successfully.`,
      url: first?.url || '',
      urls: processedResults.map((r) => r.url),
      items: processedResults,
      fileName: first?.fileName,
      fileSize: first?.fileSize,
      mimeType: first?.mimeType,
      media: first?.media,
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
