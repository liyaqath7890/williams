import { AlertTriangle, Bell, CheckCircle2, RadioTower } from 'lucide-react';
import { useSelector } from 'react-redux';

const notifications = [
  {
    id: 'sos-east-bank',
    title: 'SOS cluster detected',
    detail: 'Three new rescue requests near East Bank sector.',
    severity: 'critical',
    time: '2 min ago',
    icon: AlertTriangle
  },
  {
    id: 'shelter-capacity',
    title: 'Shelter capacity update',
    detail: 'Central High School shelter has 34 beds available.',
    severity: 'info',
    time: '8 min ago',
    icon: CheckCircle2
  },
  {
    id: 'team-live',
    title: 'Team Bravo online',
    detail: 'Live tracking resumed for assigned rescue team.',
    severity: 'normal',
    time: '14 min ago',
    icon: RadioTower
  }
];

const severityStyles = {
  critical: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-teal-200 bg-teal-50 text-teal-700',
  normal: 'border-slate-200 bg-white text-slate-700'
};

export default function NotificationPanel({ compact = false }) {
  const liveAlerts = useSelector((state) => state.alerts.items);
  const mergedNotifications = [
    ...liveAlerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      detail: alert.message,
      severity: alert.severity === 'critical' ? 'critical' : 'info',
      time: 'Live now',
      icon: AlertTriangle
    })),
    ...notifications
  ].slice(0, 5);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-aegis-primary" />
          <h3 className="font-semibold text-slate-950">Notifications</h3>
        </div>
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{mergedNotifications.length} live</span>
      </div>
      <div className={compact ? 'divide-y divide-slate-100' : 'space-y-3 p-4'}>
        {mergedNotifications.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.id} className={`${compact ? 'px-4 py-3' : 'rounded-md border p-3'} ${severityStyles[item.severity]}`}>
              <div className="flex gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">{item.detail}</p>
                  <p className="mt-2 text-xs font-medium opacity-70">{item.time}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
