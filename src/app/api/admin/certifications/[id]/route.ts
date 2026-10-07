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
 * GET /api/admin/certifications/[id]
 * Retrieves details for a specific certification.
 */
export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await props.params;

  try {
    const cert = await AdminService.getCertificationById(id);
    if (!cert) {
      return NextResponse.json(
        { error: 'Certification not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certification: cert,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve certification';
    console.error(`[GET /api/admin/certifications/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while loading certification.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/certifications/[id]
 * Updates an existing certification entry.
 */
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await props.params;

  try {
    const existing = await AdminService.getCertificationById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Certification not found.' },
        { status: 404 }
      );
    }

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

    // 1. Mandatory Validations when provided
    if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
      return NextResponse.json(
        { error: 'Certification name / title cannot be empty.' },
        { status: 400 }
      );
    }

    if (issuer !== undefined && (!issuer || typeof issuer !== 'string' || !issuer.trim())) {
      return NextResponse.json(
        { error: 'Issuing organization cannot be empty.' },
        { status: 400 }
      );
    }

    if (issue_date !== undefined && (!issue_date || typeof issue_date !== 'string' || !issue_date.trim())) {
      return NextResponse.json(
        { error: 'Issue date cannot be empty.' },
        { status: 400 }
      );
    }

    // 2. Date Comparison Validation
    const effectiveIssueDate = issue_date !== undefined ? issue_date : existing.issue_date;
    const effectiveExpDate = expiration_date !== undefined ? expiration_date : existing.expiration_date;

    if (effectiveExpDate && effectiveIssueDate) {
      const issueTime = new Date(effectiveIssueDate).getTime();
      const expireTime = new Date(effectiveExpDate).getTime();
      if (!isNaN(issueTime) && !isNaN(expireTime) && expireTime < issueTime) {
        return NextResponse.json(
          { error: 'Expiration date cannot precede the issue date.' },
          { status: 400 }
        );
      }
    }

    // 3. URL Validations
    if (credential_url !== undefined && !isValidUrl(credential_url)) {
      return NextResponse.json(
        { error: 'Credential URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    if ((image_url !== undefined || image !== undefined) && !isValidUrl(image_url || image)) {
      return NextResponse.json(
        { error: 'Certificate image URL must be a valid URL starting with http://, https://, or /' },
        { status: 400 }
      );
    }

    // 4. Build Updated Record
    const updatedStatus: PublishStatus =
      status !== undefined && VALID_STATUSES.includes(status) ? status : existing.status;

    const updatedEnabled: boolean =
      enabled !== undefined
        ? Boolean(enabled)
        : status !== undefined
        ? status === 'published'
        : existing.enabled ?? (existing.status === 'published');

    const payload: Partial<Certification> = {
      id: existing.id,
      title: title !== undefined ? title.trim() : existing.title,
      issuer: issuer !== undefined ? issuer.trim() : existing.issuer,
      issue_date: issue_date !== undefined ? issue_date.trim() : existing.issue_date,
      expiration_date:
        expiration_date !== undefined
          ? (expiration_date ? expiration_date.trim() : null)
          : existing.expiration_date,
      credential_id:
        credential_id !== undefined
          ? (credential_id ? String(credential_id).trim() : null)
          : existing.credential_id,
      credential_url:
        credential_url !== undefined
          ? (credential_url ? credential_url.trim() : null)
          : existing.credential_url,
      image:
        image_url !== undefined || image !== undefined
          ? (image_url?.trim() || image?.trim() || null)
          : existing.image,
      image_url:
        image_url !== undefined || image !== undefined
          ? (image_url?.trim() || image?.trim() || null)
          : existing.image_url,
      description:
        description !== undefined ? String(description).trim() : existing.description,
      display_order:
        typeof display_order === 'number' ? display_order : existing.display_order,
      enabled: updatedEnabled,
      status: updatedStatus,
    };

    const updated = await AdminService.upsertCertification(payload);

    revalidatePath('/');
    revalidatePath('/admin/certifications');

    return NextResponse.json({
      success: true,
      certification: updated,
      message: 'Certification updated successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update certification';
    console.error(`[PUT /api/admin/certifications/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while updating certification.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/certifications/[id]
 * Deletes a certification.
 */
export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const isAuthorized = await AuthServerService.isAdmin();
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized. Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await props.params;

  try {
    const existing = await AdminService.getCertificationById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Certification not found.' },
        { status: 404 }
      );
    }

    await AdminService.deleteCertification(id);

    revalidatePath('/');
    revalidatePath('/admin/certifications');

    return NextResponse.json({
      success: true,
      message: 'Certification deleted successfully.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete certification';
    console.error(`[DELETE /api/admin/certifications/${id}] Error:`, errorMsg);
    return NextResponse.json(
      { error: 'Internal server error while deleting certification.' },
      { status: 500 }
    );
  }
}
