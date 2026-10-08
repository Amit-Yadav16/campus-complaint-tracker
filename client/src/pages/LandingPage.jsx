import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function UnmuteLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 2L4 10V26C4 36.5 13 44.8 24 47C35 44.8 44 36.5 44 26V10L24 2Z" fill="#1d4ed8" />
      <path d="M24 2L4 10V26C4 36.5 13 44.8 24 47C35 44.8 44 36.5 44 26V10L24 2Z" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Graduation cap */}
      <path d="M24 14L12 19.5L24 25L36 19.5L24 14Z" fill="white" />
      <path d="M18 22V29C18 29 20 31.5 24 31.5C28 31.5 30 29 30 29V22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="19.5" x2="36" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="36" cy="27" r="1.5" fill="white" />
    </svg>
  );
}

// ── Complaint tracker card mockup ─────────────────────────────────────────────
function ComplaintCard() {
  const steps = [
    { label: 'Complaint Submitted', sub: 'ID: UM2026001', done: true, active: false },
    { label: 'Under Review',        sub: 'By Admin',     done: true, active: false },
    { label: 'In Progress',         sub: 'By Dept',      done: false, active: true },
    { label: 'Resolved',            sub: 'Awaiting Confirmation', done: false, active: false },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-5 w-72 border border-gray-100">
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
            ${s.done ? 'bg-green-500 text-white' : s.active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-400'}`}>
            {s.done ? '✓' : s.active ? '●' : '○'}
          </div>
          <div>
            <p className={`text-sm font-bold ${s.done ? 'text-gray-800' : s.active ? 'text-blue-700' : 'text-gray-400'}`}>{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="absolute ml-3 mt-7 w-0.5 h-4 bg-gray-200 hidden" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Admin stats card mockup ────────────────────────────────────────────────────
function AdminCard() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-5 w-64 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs">📊</span>
        </div>
        <p className="text-sm font-bold text-gray-800">Admin Dashboard</p>
      </div>
      {[
        { label: 'Total Complaints', value: '24', bar: 100, color: 'bg-blue-500' },
        { label: 'In Progress',      value: '12', bar: 50,  color: 'bg-yellow-400' },
        { label: 'Resolved',         value: '10', bar: 42,  color: 'bg-green-500' },
      ].map((r) => (
        <div key={r.label} className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{r.label}</span>
            <span className="font-bold text-gray-800">{r.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${r.bar}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feature items ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🙋', color: 'bg-blue-100 text-blue-700',   label: 'Easy to Raise',       desc: 'Submit complaints in just a few clicks using your college email.' },
  { icon: '🔍', color: 'bg-green-100 text-green-700',  label: 'Real-Time Tracking',  desc: 'Know the status and progress of your complaint at every stage.' },
  { icon: '🛡', color: 'bg-purple-100 text-purple-700',label: 'Accountability',       desc: 'Ensures timely action with SLA, escalation and approval workflow.' },
  { icon: '🔔', color: 'bg-yellow-100 text-yellow-700',label: 'Notifications',        desc: 'Get instant updates and alerts on your complaint status.' },
  { icon: '🏫', color: 'bg-teal-100 text-teal-700',    label: 'Better Campus Life',   desc: 'Helps create a safer, fairer and more responsive campus for everyone.' },
];

// ── Navbar ────────────────────────────────────────────────────────────────────
function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <UnmuteLogo size={38} />
          <div>
            <span className="text-xl font-black text-gray-900 tracking-tight">UNMUTE</span>
            <p className="text-[10px] text-gray-400 leading-none -mt-0.5">Your Voice | Our Responsibility</p>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <a href="#home"     className="text-blue-600 border-b-2 border-blue-600 pb-0.5">Home</a>
          <a href="#about"    className="hover:text-gray-900 transition">About</a>
          <a href="#features" className="hover:text-gray-900 transition">Features</a>
          <a href="#contact"  className="hover:text-gray-900 transition">Contact</a>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="text-sm font-bold text-blue-700 border-2 border-blue-600 px-5 py-2 rounded-full hover:bg-blue-50 transition">
            Login
          </Link>
          <Link to="/login"
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition shadow">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, go to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'admin')   navigate('/admin/dashboard');
      else if (user.role === 'hod')     navigate('/hod/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen font-sans">
      <LandingNav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative pt-20 min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #0f2d5a 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center w-full">

          {/* Left — Text content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-400/30 text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              A Transparent &amp; Accountable Campus
            </div>

            {/* Main headline */}
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
              <span className="text-white">Raise Your</span>{' '}
              <span className="text-blue-400">Concern.</span>
              <br />
              <span className="text-white">Track the</span>{' '}
              <span className="text-blue-400">Progress.</span>
              <br />
              <span className="text-green-400">Get Results.</span>
            </h1>

            {/* Sub text */}
            <p className="text-gray-300 text-lg font-medium leading-relaxed mb-8 max-w-lg">
              <strong className="text-white">UNMUTE</strong> helps students raise complaints,
              track status in real-time and ensures accountability
              until the issue is actually resolved.
            </p>

            {/* CTA buttons */}
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-7 py-3.5 rounded-full shadow-lg shadow-blue-600/40 transition"
              >
                Login with College Email →
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-bold text-base px-7 py-3.5 rounded-full transition"
              >
                Learn More
              </a>
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 mt-10">
              {[
                { v: '100%', l: 'Transparent' },
                { v: 'SLA',  l: 'Enforced Deadlines' },
                { v: 'HOD',  l: 'Auto-Escalation' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <p className="text-2xl font-black text-white">{v}</p>
                  <p className="text-xs text-gray-400 font-medium">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Cards */}
          <div className="relative flex flex-col items-center lg:items-end gap-4 mt-8 lg:mt-0">
            {/* Complaint tracker card */}
            <div className="relative z-10">
              <ComplaintCard />
            </div>

            {/* Admin dashboard card — offset to right/bottom */}
            <div className="relative z-10 lg:-mt-6 lg:mr-[-2rem]">
              <AdminCard />
            </div>

            {/* Bottom tagline */}
            <div className="mt-2 text-right">
              <p className="text-white/80 italic font-semibold text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                Better Communication.
              </p>
              <p className="text-green-400 italic font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                A Stronger Campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ───────────────────────────────────────────────── */}
      <section id="features" className="bg-gray-50 border-t border-gray-200 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-3xl font-black text-gray-900 mb-10">
            Why Students Choose <span className="text-blue-600">UNMUTE</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {FEATURES.map(({ icon, color, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 ${color}`}>
                  {icon}
                </div>
                <p className="text-sm font-black text-gray-900 mb-1">{label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="about" className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 text-base mb-12 font-medium">Four simple steps from complaint to resolution</p>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { n: '1', icon: '📝', title: 'Submit',    desc: 'Login with college email and describe your issue' },
              { n: '2', icon: '⚙️', title: 'Assigned',  desc: 'Auto-assigned to the right department with SLA timer' },
              { n: '3', icon: '🔄', title: 'Tracked',   desc: 'Real-time stage updates — you always know what\'s happening' },
              { n: '4', icon: '✅', title: 'Confirmed', desc: 'Only YOU confirm the complaint is resolved — not the admin' },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="relative">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-blue-200">
                  {icon}
                </div>
                <div className="absolute -top-2 -right-1 w-6 h-6 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center">
                  {n}
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Critical rule callout */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <p className="text-2xl font-black mb-2">🔐 The Golden Rule</p>
            <p className="text-lg font-semibold text-blue-100">
              Admins <strong className="text-white underline underline-offset-4">cannot</strong> close your complaint.
              Only your <strong className="text-green-300">YES</strong> confirmation marks it as resolved.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER / CONTACT ─────────────────────────────────────────────── */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <UnmuteLogo size={36} />
            <div>
              <p className="text-xl font-black">UNMUTE</p>
              <p className="text-xs text-gray-400">Your Voice | Our Responsibility</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium text-center">
            © 2026 UNMUTE — Campus Complaint Tracker. Built for transparent, accountable campuses.
          </p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-full transition"
          >
            Login to App →
          </Link>
        </div>
      </footer>
    </div>
  );
}
