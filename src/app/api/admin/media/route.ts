import { NextResponse } from 'next/server';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/media
 * Lists all portfolio media items with real-time usage references.
 * Query Parameters:
 * - search: string (matches title, file_name, description, alt_text, mime_type)
 * - type: 'all' | 'image' | 'document' | 'video'
 * - sort: 'newest' | 'oldest' | 'name' | 'size'
 * - page: number (default 1)
 * - limit: number (default 50)
 * Guarded by AuthServerService.isAdmin().
 */
export async function GET(request: Request) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));

    const allMedia = await AdminService.getAllMedia({ search, type, sort });
    const total = allMedia.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = allMedia.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      media: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve media library';
    console.error('[GET /api/admin/media] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while loading the media library.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/media
 * Direct media upload endpoint. Delegates to AdminService.uploadAndRegisterMedia.
 * Accepts multipart/form-data with file and optional title/alt_text/description/bucket.
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
    const title = (formData.get('title') as string) || '';
    const altText = (formData.get('alt_text') as string) || '';
    const description = (formData.get('description') as string) || '';
    const bucket = (formData.get('bucket') as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in the upload request.' },
        { status: 400 }
      );
    }

    const uploadRes = await AdminService.uploadAndRegisterMedia(file, {
      title: title || undefined,
      alt_text: altText || undefined,
      description: description || undefined,
      bucket,
    });

    if (!uploadRes.success) {
      return NextResponse.json(
        { error: uploadRes.error || 'Failed to upload media asset.' },
        { status: uploadRes.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Media uploaded and registered successfully.',
        media: uploadRes.media,
        url: uploadRes.url,
        fileName: uploadRes.fileName,
        fileSize: uploadRes.fileSize,
        mimeType: uploadRes.mimeType,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Media upload failed';
    console.error('[POST /api/admin/media] Error:', msg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while uploading media.' },
      { status: 500 }
    );
  }
}
