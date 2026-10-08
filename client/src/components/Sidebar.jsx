import { NavLink } from 'react-router-dom';

const NAV_ITEMS = {
  student: [
    { to: '/student/dashboard',  icon: '🏠', label: 'Dashboard' },
    { to: '/student/submit',     icon: '📝', label: 'Submit Complaint' },
    { to: '/student/complaints', icon: '📋', label: 'My Complaints' },
  ],
  admin: [
    { to: '/admin/dashboard',    icon: '🏠', label: 'Dashboard' },
    { to: '/admin/complaints',   icon: '📋', label: 'Complaint Queue' },
  ],
  hod: [
    { to: '/hod/dashboard',      icon: '🏠', label: 'Dashboard' },
    { to: '/hod/escalated',      icon: '⚠️', label: 'Escalated Cases' },
  ],
};

export default function Sidebar({ role }) {
  const items = NAV_ITEMS[role] || [];
  return (
    <aside className="hidden sm:flex flex-col w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] py-4 px-3 shrink-0">
      <nav className="space-y-0.5">
        {items.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
              ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
