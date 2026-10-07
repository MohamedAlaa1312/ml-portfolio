import { redirect } from 'next/navigation';
import { AuthServerService } from '@/services/auth.server';

export const dynamic = 'force-dynamic';

/**
 * /admin Gateway Route.
 * Seamlessly directs authenticated administrators to /admin/dashboard,
 * and unauthenticated visitors to /admin/login.
 */
export default async function AdminGatewayPage() {
  const isAdmin = await AuthServerService.isAdmin();

  if (isAdmin) {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
