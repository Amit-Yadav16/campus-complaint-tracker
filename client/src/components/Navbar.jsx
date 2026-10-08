import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-700',
  admin:   'bg-green-100 text-green-700',
  hod:     'bg-purple-100 text-purple-700',
};

const TYPE_ICONS = { info: 'ℹ️', warning: '⚠️', success: '✅', error: '❌' };

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  // Fetch notifications every 30s
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = () => {
      api.get('/notifications').then(({ data }) => setNotifications(data.notifications)).catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center shrink-0" style={{background:'linear-gradient(135deg,#1d4ed8,#1e40af)'}}>
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <path d="M24 2L4 10V26C4 36.5 13 44.8 24 47C35 44.8 44 36.5 44 26V10L24 2Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
            <path d="M24 14L12 19.5L24 25L36 19.5L24 14Z" fill="white"/>
            <path d="M18 22V29C18 29 20 31.5 24 31.5C28 31.5 30 29 30 29V22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="36" y1="19.5" x2="36" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="36" cy="27" r="1.5" fill="white"/>
          </svg>
        </div>
        <div className="leading-tight">
          <span className="font-black text-gray-900 text-lg tracking-tight">UNMUTE</span>
          <p className="text-[9px] text-gray-400 font-medium -mt-0.5">Your Voice | Our Responsibility</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* User info (desktop) */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-gray-800">{user.name}</span>
          <span className="text-xs text-gray-400">{user.collegeEmail}</span>
        </div>

        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600'}`}>
          {user.role}
        </span>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative p-2 text-gray-500 hover:text-blue-600 transition rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <p className="text-center py-8 text-sm text-gray-400">No notifications</p>
                ) : (
                  notifications.slice(0, 15).map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 ${!n.read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition cursor-default`}
                    >
                      <div className="flex gap-2">
                        <span className="text-base shrink-0">{TYPE_ICONS[n.type] || 'ℹ️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 font-medium transition flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
