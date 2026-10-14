import { NextResponse } from 'next/server';
import { AdminService } from '@/services/admin.service';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact
 * Public endpoint for visitors to transmit inquiries or messages.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload. JSON format required.' },
        { status: 400 }
      );
    }

    const { name, email, message, subject } = body;

    // Validate Name
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Please provide your name.' },
        { status: 400 }
      );
    }

    // Validate Email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Validate Message
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Message must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    const saved = await AdminService.saveContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: typeof subject === 'string' && subject.trim() ? subject.trim() : 'Project Inquiry',
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Transmission acknowledged. Message delivered successfully.',
      id: saved.id,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Transmission failed';
    console.error('[POST /api/contact] Error:', errorMsg);
    return NextResponse.json(
      { error: 'An unexpected error occurred while transmitting your message.' },
      { status: 500 }
    );
  }
}
