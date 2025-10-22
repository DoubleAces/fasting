/**
 * AdminHeader Component
 * 
 * Minimal header bar for admin area.
 * Shows only the page title - user info in sidebar would be better UX.
 */

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
    </header>
  );
}
