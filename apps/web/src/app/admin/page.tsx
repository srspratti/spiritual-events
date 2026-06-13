import AdminDashboard from './admin-dashboard';

export default function AdminPage() {
  return (
    <main className="container">
      <h1>Admin moderation</h1>
      <p className="notice">Use the ADMIN_TOKEN from your environment. In production, replace this with Clerk/Auth0/Supabase Auth and role-based access.</p>
      <AdminDashboard />
    </main>
  );
}
