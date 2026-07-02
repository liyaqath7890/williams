import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { runPredictionSimulation } from '../../ai/predictionSimulator';
import { operationsService } from '../../services/operationsService';

const fallback = {
  summary: { incidents: 27, resolvedIncidents: 19, activeMissions: 8, users: 48 },
  incidentTrend: [
    { name: 'Mon', incidents: 12, resolved: 8 },
    { name: 'Tue', incidents: 17, resolved: 12 },
    { name: 'Wed', incidents: 23, resolved: 15 },
    { name: 'Thu', incidents: 19, resolved: 16 }
  ],
  resourceMix: [
    { name: 'Food', value: 34 },
    { name: 'Water', value: 42 },
    { name: 'Medical', value: 18 },
    { name: 'Equipment', value: 14 }
  ]
};

const colors = ['#0f766e', '#0284c7', '#dc2626', '#f59e0b'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(fallback);
  const prediction = runPredictionSimulation({ rainfallMm: 145 });

  useEffect(() => {
    operationsService.getAnalytics().then((response) => setAnalytics(response.data.data)).catch(() => setAnalytics(fallback));
  }, []);

  return (
    <>
      <PageHeader title="Analytics Dashboard" description="Monitor rescue performance, active missions, resources, disaster trends, and AI simulation output." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={AlertTriangle} label="Incidents" value={String(analytics.summary.incidents)} tone="danger" />
        <StatCard icon={ShieldCheck} label="Resolved" value={String(analytics.summary.resolvedIncidents)} />
        <StatCard icon={Activity} label="AI Risk" value={prediction.riskLevel} helper={`${Math.round(prediction.confidence * 100)}% confidence`} tone="amber" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-950">Incident Trend</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={analytics.incidentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="incidents" fill="#dc2626" />
                <Bar dataKey="resolved" fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-950">Resource Mix</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={analytics.resourceMix} dataKey="value" nameKey="name" outerRadius={110} label>
                  {analytics.resourceMix.map((entry, index) => <Cell fill={colors[index % colors.length]} key={entry.name} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}
