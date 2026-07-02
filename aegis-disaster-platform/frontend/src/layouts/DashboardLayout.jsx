import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangle, BarChart3, Bell, Bot, CloudUpload,
  Home, LifeBuoy, LogOut, Map, Menu, MessageCircle,
  Package, Plane, Search, Shield, Siren, FileText, Warehouse, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { ROLE_LABELS, canAccessRoute, normalizeRole } from '../constants/roleAccess';
import { logout } from '../redux/features/auth/authSlice';

const SIDEBAR_LINKS = {
  victim: [
    { label: 'Dashboard', to: ROUTES.VICTIM_DASHBOARD, icon: Home },
    { label: 'Send SOS / My SOS', to: ROUTES.SOS, icon: Siren },
    { label: 'Nearby Shelters', to: ROUTES.SHELTERS, icon: Warehouse },
    { label: 'Disaster Map', to: ROUTES.MAPS, icon: Map },
    { label: 'Missing Persons', to: ROUTES.MISSING_PERSONS, icon: Search },
    { label: 'Emergency Chat', to: ROUTES.CHAT, icon: MessageCircle }
  ],
  helper: [
    { label: 'Dashboard', to: ROUTES.HELPER_DASHBOARD, icon: Home },
    { label: 'Emergency Requests', to: `${ROUTES.HELPER_DASHBOARD}?view=requests`, icon: Siren },
    { label: 'Assigned Missions', to: `${ROUTES.HELPER_DASHBOARD}?view=assigned`, icon: LifeBuoy },
    { label: 'Live Map', to: ROUTES.MAPS, icon: Map },
    { label: 'Missing Person Search', to: ROUTES.MISSING_PERSONS, icon: Search },
    { label: 'Resource Requests', to: ROUTES.RESOURCES, icon: Package },
    { label: 'Chat', to: ROUTES.CHAT, icon: MessageCircle }
  ],
  admin: [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: Home },
    { label: 'Map', to: ROUTES.MAPS, icon: Map },
    { label: 'Chat', to: ROUTES.CHAT, icon: MessageCircle },
    { label: 'Shelters', to: ROUTES.SHELTERS, icon: Warehouse },
    { label: 'Missing Persons', to: ROUTES.MISSING_PERSONS, icon: Search },
    { label: 'Resources', to: ROUTES.RESOURCES, icon: Package },
    { label: 'Analytics', to: ROUTES.ANALYTICS, icon: BarChart3 },
    { label: 'Reports', to: ROUTES.REPORTS, icon: FileText },
    { label: 'Alerts', to: ROUTES.ALERTS, icon: AlertTriangle },
    { label: 'AI Prediction', to: ROUTES.AI, icon: Bot },
    { label: 'Drone Control', to: ROUTES.DRONE, icon: Plane },
    { label: 'Upload Center', to: ROUTES.UPLOADS, icon: CloudUpload }
  ]
};
SIDEBAR_LINKS.authority = SIDEBAR_LINKS.admin;

const ALL_LINKS = [
  { label: 'Victim',     to: ROUTES.VICTIM_DASHBOARD, icon: Home          },
  { label: 'Authority',  to: ROUTES.ADMIN_DASHBOARD,  icon: Shield        },
  { label: 'Helper',     to: ROUTES.HELPER_DASHBOARD, icon: LifeBuoy      },
  { label: 'SOS',        to: ROUTES.SOS,              icon: Siren         },
  { label: 'Map',        to: ROUTES.MAPS,             icon: Map           },
  { label: 'Chat',       to: ROUTES.CHAT,             icon: MessageCircle },
  { label: 'Shelters',   to: ROUTES.SHELTERS,         icon: Warehouse     },
  { label: 'Missing',    to: ROUTES.MISSING_PERSONS,  icon: Search        },
  { label: 'Resources',  to: ROUTES.RESOURCES,        icon: Package       },
  { label: 'Analytics',  to: ROUTES.ANALYTICS,        icon: BarChart3     },
  { label: 'Reports',    to: ROUTES.REPORTS,          icon: FileText      },
  { label: 'Alerts',     to: ROUTES.ALERTS,           icon: AlertTriangle },
  { label: 'AI',         to: ROUTES.AI,               icon: Bot           },
  { label: 'Drone',      to: ROUTES.DRONE,            icon: Plane         },
  { label: 'Uploads',    to: ROUTES.UPLOADS,          icon: CloudUpload   },
];

// Mobile bottom-nav shows only the 5 most relevant links per role
const BOTTOM_NAV_ROLES = {
  victim:    [ROUTES.VICTIM_DASHBOARD, ROUTES.SOS, ROUTES.MAPS, ROUTES.SHELTERS, ROUTES.CHAT],
  helper:    [ROUTES.HELPER_DASHBOARD, ROUTES.MAPS, ROUTES.RESOURCES, ROUTES.CHAT, ROUTES.MISSING_PERSONS],
  authority: [ROUTES.ADMIN_DASHBOARD,  ROUTES.ALERTS, ROUTES.ANALYTICS, ROUTES.MAPS, ROUTES.CHAT],
  admin:     [ROUTES.ADMIN_DASHBOARD,  ROUTES.ALERTS, ROUTES.ANALYTICS, ROUTES.DRONE, ROUTES.UPLOADS],
};

const ROLE_COLORS = {
  victim:    'from-rose-600   to-red-700',
  helper:    'from-teal-600   to-emerald-700',
  authority: 'from-indigo-600 to-violet-700',
  admin:     'from-slate-700  to-slate-900',
};

export default function DashboardLayout() {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const user      = useSelector((s) => s.auth.user);
  const alerts    = useSelector((s) => s.alerts.items);
  const [sidebarOpen, setSidebar] = useState(false);
  const [notifOpen,   setNotif]   = useState(false);
  const notifRef = useRef(null);

  const role      = normalizeRole(user?.role);
  const roleLabel = ROLE_LABELS[role] || 'Responder';
  const gradient  = ROLE_COLORS[role] || ROLE_COLORS.authority;
  const visible   = SIDEBAR_LINKS[role] || [];
  const bottomLinks = (BOTTOM_NAV_ROLES[role] || [])
    .map((to) => {
      const allMatches = [
        ...(SIDEBAR_LINKS.victim || []),
        ...(SIDEBAR_LINKS.helper || []),
        ...(SIDEBAR_LINKS.admin || [])
      ];
      return allMatches.find((l) => l.to === to) || ALL_LINKS.find((l) => l.to === to);
    })
    .filter(Boolean);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebar(false); }, [location.pathname]);

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotif(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = alerts.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* â”€â”€ DESKTOP SIDEBAR â”€â”€ */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col z-30 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <Shield className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none">AEGIS</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">Disaster Intel</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4">
          <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg`}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl shrink-0">
                {user?.name?.charAt(0) || 'R'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{user?.name || 'Responder'}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-75">{roleLabel}</p>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50 ml-auto shrink-0" />
            </div>
          </div>
        </div>

        {/* Quick help */}
        <div className="mx-4 mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">How Aegis Works</p>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2"><span className="text-indigo-400 shrink-0 mt-0.5">â–¸</span>Victims send SOS, find shelters, get alerts.</li>
            <li className="flex items-start gap-2"><span className="text-teal-400 shrink-0 mt-0.5">â–¸</span>Helpers coordinate resources and missions.</li>
            <li className="flex items-start gap-2"><span className="text-violet-400 shrink-0 mt-0.5">â–¸</span>Authorities manage alerts and analytics.</li>
          </ul>
        </div>

        {/* SOS button for victim */}
        {role === ROLES.VICTIM && (
          <div className="px-4 mb-3">
            <NavLink
              to={ROUTES.SOS}
              className="sos-ring flex items-center justify-center gap-2 w-full rounded-2xl bg-red-600 py-3.5 text-sm font-black text-white shadow-xl shadow-red-200 hover:bg-red-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Siren className="h-5 w-5 animate-pulse" />
              PANIC / SEND SOS
            </NavLink>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 pb-2 custom-scrollbar">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Navigation</p>
          <div className="space-y-0.5">
            {visible.map(({ icon: Icon, label, to }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                    </div>
                    <span>{label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          <button
            onClick={() => dispatch(logout())}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* â”€â”€ MOBILE SIDEBAR DRAWER â”€â”€ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebar(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col lg:hidden"
              style={{ paddingTop: 'var(--safe-top)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <Shield className="text-white h-4 w-4" />
                  </div>
                  <span className="font-black text-slate-900">AEGIS</span>
                </div>
                <button onClick={() => setSidebar(false)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-4 py-3">
                <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 text-white`}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center font-black">
                      {user?.name?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user?.name || 'Responder'}</p>
                      <p className="text-[10px] opacity-75 uppercase tracking-widest">{roleLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {role === ROLES.VICTIM && (
                <div className="px-4 mb-2">
                  <NavLink
                    to={ROUTES.SOS}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 py-3 text-sm font-black text-white shadow-lg shadow-red-200"
                  >
                    <Siren className="h-4 w-4 animate-pulse" />
                    PANIC / SEND SOS
                  </NavLink>
                </div>
              )}

              <nav className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <div className="space-y-0.5">
                  {visible.map(({ icon: Icon, label, to }) => (
                    <NavLink
                      key={to} to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          </div>
                          {label}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </nav>

              <div className="px-4 pb-6 pt-2 border-t border-slate-100" style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}>
                <button
                  onClick={() => dispatch(logout())}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Terminate Session
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6"
          style={{ paddingTop: 'max(0.75rem, var(--safe-top))' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebar(true)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 lg:hidden touch-target"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden xs:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">Disaster response command workspace</p>
                <p className="text-xs text-slate-500">Live operations Â· Secure session Â· {roleLabel}</p>
              </div>
              {/* Mobile title */}
              <p className="text-sm font-bold text-slate-900 xs:hidden">AEGIS</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotif((o) => !o)}
                  className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unread.length > 0 && (
                    <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-600 text-[10px] font-black text-white flex items-center justify-center">
                      {unread.length > 9 ? '9+' : unread.length}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-sm">Notifications</p>
                        <span className="text-xs text-indigo-600 font-bold">{unread.length} new</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {unread.length === 0 ? (
                          <p className="px-4 py-6 text-center text-sm text-slate-500">No new notifications</p>
                        ) : (
                          unread.map((a) => (
                            <div key={a.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                              <div className="flex items-start gap-2.5">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                                  a.severity === 'critical' ? 'bg-red-500' : a.severity === 'danger' ? 'bg-orange-500' : 'bg-amber-400'
                                }`} />
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User badge */}
              <div className={`hidden sm:flex items-center gap-2.5 rounded-xl bg-gradient-to-br ${gradient} px-3 py-2 text-white`}>
                <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                  {user?.name?.charAt(0) || 'R'}
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold leading-tight">{user?.name || 'Responder'}</p>
                  <p className="text-[10px] opacity-75">{roleLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 dashboard-content">
          <Outlet />
        </main>
      </div>

      {/* â”€â”€ MOBILE BOTTOM NAV â”€â”€ */}
      <nav className="bottom-nav lg:hidden">
        <div className="flex items-center justify-around px-2 pt-2" style={{ paddingBottom: 'max(0.5rem, var(--safe-bottom))' }}>
          {bottomLinks.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[52px] ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-indigo-100 scale-110' : 'hover:bg-slate-100'
                  }`}>
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  </div>
                  <span className="text-[10px] font-bold leading-none">{label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-indigo-600" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

