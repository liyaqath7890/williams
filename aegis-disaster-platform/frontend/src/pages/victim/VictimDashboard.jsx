import { AlertTriangle, BellRing, MapPin, Siren, Warehouse, ArrowRight, CheckCircle, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import IncidentList from '../../components/dashboard/IncidentList';
import MissionTimeline from '../../components/dashboard/MissionTimeline';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import { ROUTES } from '../../constants/routes';

const timeline = [
  {
    title: 'Location shared',
    detail: 'Your current rescue location is ready for SOS dispatch.',
    time: 'Now',
    status: 'completed'
  },
  {
    title: 'Emergency contact check',
    detail: 'Keep your phone reachable for authority callback.',
    time: 'Next step',
    status: 'active'
  },
  {
    title: 'Rescue team assignment',
    detail: 'Team assignment appears after SOS submission.',
    time: 'Pending',
    status: 'pending'
  }
];

const safetyItems = [
  { label: 'Nearest safe zone',  detail: 'North Municipal School · 1.8 km',             icon: MapPin,      color: 'text-indigo-600 bg-indigo-50' },
  { label: 'Medical support',    detail: 'Available at Central Shelter',                  icon: Activity,    color: 'text-teal-600 bg-teal-50'    },
  { label: 'Emergency guidance', detail: 'Move to higher ground. Keep ID documents ready.', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
  { label: 'Rescue chat',        detail: 'Use Chat tab after SOS is assigned.',           icon: BellRing,    color: 'text-rose-600 bg-rose-50'    },
];

export default function VictimDashboard() {
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="text-3xl font-black">{user?.name || 'Responder'}</h1>
            <p className="text-indigo-200 text-sm mt-1">Your safety dashboard is active and monitoring.</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-3xl font-black text-white">{user?.name?.charAt(0) || 'V'}</span>
          </div>
        </div>
        <Link
          to={ROUTES.SOS}
          className="mt-5 inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-red-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
        >
          <Siren className="h-5 w-5 animate-pulse" />
          SEND SOS — Emergency Rescue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard icon={AlertTriangle} label="Active SOS"       value="0" helper="No live distress request"           tone="danger" />
        <StatCard icon={Warehouse}    label="Nearby Shelters"  value="6" helper="Within 5 km radius"                              />
        <StatCard icon={BellRing}     label="Unread Alerts"    value="3" helper="Weather and route advisories"        tone="amber" />
        <StatCard icon={MapPin}       label="Location Status"  value="Ready" helper="GPS coordinates available"      tone="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          {/* Safety Guidance */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-900 text-lg mb-5">Safety Guidance</h2>
            <div className="space-y-3">
              {safetyItems.map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.detail}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 ml-auto mt-1 shrink-0" />
                </div>
              ))}
            </div>
          </section>
          <IncidentList title="Nearby Emergency Activity" />
        </div>

        <div className="space-y-6">
          <NotificationPanel compact />
          <MissionTimeline items={timeline} />

          {/* Quick Actions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-900 text-base mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Find Shelters',        to: ROUTES.SHELTERS,        icon: Warehouse,     color: 'text-teal-600'   },
                { label: 'View Live Map',        to: ROUTES.MAPS,            icon: MapPin,        color: 'text-indigo-600' },
                { label: 'Report Missing Person', to: ROUTES.MISSING_PERSONS, icon: AlertTriangle, color: 'text-amber-600'  },
                { label: 'Emergency Chat',       to: ROUTES.CHAT,            icon: BellRing,      color: 'text-rose-600'   },
              ].map(({ label, to, icon: Icon, color }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
