import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminSocialRedirectPage() {
  redirect('/admin/contact?tab=social');
}
