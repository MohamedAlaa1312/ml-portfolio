import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { AuthServerService } from '@/services/auth.server';
import { AdminService } from '@/services/admin.service';
import type { Certification, PublishStatus } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: PublishStatus[] = ['draft', 'published', 'archived'];

function isValidUrl(val?: string | null): boolean {
  if (!val || !val.trim()) return true;
  const trimmed = val.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return true;
  }
  return false;
}

/**
 * GET /api/admin/certifications
 * Retrieves all certifications ordered by display_order.
 */
export async function GET() {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const list = await AdminService.getAllCertifications();
    return NextResponse.json({
      success: true,
      certifications: list,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch certifications';
    console.error('[GET /api/admin/certifications] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading certifications.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/certifications
 * Creates a new certification entry.
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
    const body = await request.json();
    const {
      title,
      issuer,
      issue_date,
      expiration_date,
      credential_id,
      credential_url,
      image,
      image_url,
      description,
      display_order,
      enabled,
      status,
    } = body;

    // 1. Mandatory Validations
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Certification name / title is required.' },
        { status: 400 }
      );
    }

    if (!issuer || typeof issuer !== 'string' || !issuer.trim()) {
      return NextResponse.json(
        { error: 'Issuing organization is required.' },
        { status: 400 }
      );
    }

    if (!issue_date || typeof issue_date !== 'string' || !issue_date.trim()) {
      return NextResponse.json(
        { error: 'Issue date is required.' },
        { status: 400 }
      );
    }

    // 2. Date Comparison Validation
    if (expiration_date && typeof expiration_date === 'string' && expiration_date.trim()) {
      const issueTime = new Date(issue_date.trim()).getTime();
      const expireTime = new Date(expiration_date.trim()).getTime();
      if (!isNaN(issueTime) && !isNaN(expireTime) && expireTime < issueTime) {
        return NextResponse.json(
          { error: 'Expiration date cannot precede the issue date.' },
          { status: 400 }
        );
      }
    }

    // 3. URL Validations
    if (!isValidUrl(credential_url)) {
      return NextResponse.json(
        { error: 'Credential URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    if (!isValidUrl(image_url || image)) {
      return NextResponse.json(
        { error: 'Certificate image URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    // 4. Resolve Order
    const existingCerts = await AdminService.getAllCertifications().catch(() => [] as Certification[]);
    const maxOrder = existingCerts.reduce((max, c) => Math.max(max, c.display_order || 0), 0);
    const parsedOrder = typeof display_order === 'number' ? display_order : maxOrder + 1;

    // 5. Status & Enabled Resolution
    const resolvedStatus: PublishStatus = VALID_STATUSES.includes(status) ? status : 'published';
    const resolvedEnabled = enabled !== undefined ? Boolean(enabled) : resolvedStatus === 'published';

    const payload: Partial<Certification> = {
      title: title.trim(),
      issuer: issuer.trim(),
      issue_date: issue_date.trim(),
      expiration_date: expiration_date ? expiration_date.trim() : null,
      credential_id: credential_id ? String(credential_id).trim() : null,
      credential_url: credential_url ? credential_url.trim() : null,
      image: image_url?.trim() || image?.trim() || null,
      image_url: image_url?.trim() || image?.trim() || null,
      description: description ? String(description).trim() : '',
      display_order: parsedOrder,
      enabled: resolvedEnabled,
      status: resolvedStatus,
    };

    const created = await AdminService.upsertCertification(payload);

    revalidatePath('/');
    revalidatePath('/admin/certifications');

    return NextResponse.json({
      success: true,
      certification: created,
      message: 'Certification created successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create certification';
    console.error('[POST /api/admin/certifications] Error:', errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while creating certification.' },
      { status: 500 }
    );
  }
}
