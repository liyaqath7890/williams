import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ShieldCheck, Users, Warehouse, Siren, Shield, Zap, Bell, Phone, Video } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import AegisTable from '../../components/common/AegisTable';
import { fetchSosIncidents } from '../../redux/features/sos/sosSlice';
import { operationsService } from '../../services/operationsService';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state) => state.sos);
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState({ summary: { incidents: 0, activeMissions: 0, resources: 0, shelters: 0 } });

  useEffect(() => {
    dispatch(fetchSosIncidents());
    operationsService.getAnalytics().then((res) => setAnalytics(res.data.data)).catch(console.error);
  }, [dispatch]);

  const handleWhatsApp = (row, type) => {
    // Standard WhatsApp protocol: https://wa.me/number?text=message
    const number = row.mobileNumber || row.phone || '1234567890'; // fallback for demo
    const message = encodeURIComponent(`Aegis Command Center: Initiating ${type} contact regarding incident ${row.id || 'LIVE'}. Please respond.`);
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  };

  const handleDirectCall = (row) => {
    const number = row.mobileNumber || row.phone;
    if (number) {
      window.open(`tel:${number}`, '_self');
    } else {
      alert('No contact number available for this incident.');
    }
  };

  const columns = [
    { 
      key: 'id', 
      label: 'Incident ID',
      render: (val) => <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{val || 'INC-TEMP'}</span>
    },
    { 
      key: 'disasterType', 
      label: 'Emergency Type',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${val === 'Flood' ? 'bg-blue-500' : 'bg-red-500'}`} />
          <span className="font-bold text-slate-900">{val || 'General Emergency'}</span>
        </div>
      )
    },
    { key: 'location', label: 'Deployment Zone', render: (loc) => loc?.address || 'Awaiting GPS' },
    { key: 'mobileNumber', label: 'Contact', render: (val) => val || 'N/A' },
    { 
      key: 'severity', 
      label: 'Priority',
      render: (val) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          val === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {val || 'High'}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: (val) => <span className="text-xs font-semibold text-slate-600 italic">{val || 'Active Dispatch'}</span> }
  ];

  const tableData = incidents;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <PageHeader 
          title="Crisis Command Center" 
          description="High-grade intelligence oversight for regional disaster response and rescue deployment." 
        />
        <div className="hidden lg:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
              </div>
            ))}
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">12 Officers Online</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Siren} label="Active Incidents" value={String(analytics.summary.incidents || 0)} helper="Total emergencies recorded" tone="danger" />
        <StatCard icon={Users} label="Active Missions" value={String(analytics.summary.activeMissions || 0)} helper="Ongoing rescue operations" tone="indigo" />
        <StatCard icon={Warehouse} label="Total Shelters" value={String(analytics.summary.shelters || 0)} helper="Operational safe zones" tone="amber" />
        <StatCard icon={Activity} label="System Health" value="Optimal" helper="Satellite & Sensor feed live" tone="slate" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          <AegisTable 
            title="Live Deployment Grid" 
            columns={columns} 
            data={tableData} 
            onWhatsApp={handleWhatsApp}
            onDirectCall={handleDirectCall}
            onEdit={(row) => console.log('Edit', row)}
            onDelete={(row) => console.log('Delete', row)}
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden group shadow-xl shadow-indigo-200">
              <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-indigo-800 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Satellite Intelligence</h3>
                <p className="text-sm text-indigo-200 leading-relaxed">
                  Deep-scanning active. Wildfire spread and flood level predictions updated 4 minutes ago.
                </p>
                <button className="mt-4 text-xs font-bold uppercase tracking-widest bg-white text-indigo-900 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                  View Heatmap
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Operational Protocol</h3>
                <p className="text-sm text-slate-500">Ensure all teams are reachable via WhatsApp or Satellite Link.</p>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-indigo-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                  Live Sync
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                Auth: Level 4
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Intel Feed</h3>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-6">
              {[
                { time: '14:20', text: 'Bridge blockade in Sector 4 cleared.', type: 'info' },
                { time: '14:15', text: 'Critical rainfall surge detected in North.', type: 'alert' },
                { time: '14:02', text: 'Shelter-14 reported food stock at 10%.', type: 'warning' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{item.time}</p>
                  <p className={`text-xs font-medium leading-relaxed ${
                    item.type === 'alert' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
              View All Logs
            </button>
          </section>

          <section className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6">
            <h3 className="font-bold text-indigo-900 mb-4">Quick Broadcast</h3>
            <textarea 
              placeholder="Type alert to all responders..."
              className="w-full h-24 bg-white border border-indigo-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button className="w-full mt-3 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
              Send Alert
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
