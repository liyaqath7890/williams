import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, MapPinned, PackageCheck, Users, AlertTriangle, CheckCircle, Clock, MapPin, Navigation } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBoard from '../../components/dashboard/StatusBoard';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import ResourceSnapshot from '../../components/dashboard/ResourceSnapshot';
import { fetchSosIncidents, updateSosIncident } from '../../redux/features/sos/sosSlice';

export default function HelperDashboard() {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state) => state.sos);
  const { user } = useSelector((state) => state.auth);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    dispatch(fetchSosIncidents());
  }, [dispatch]);

  const currentView = searchParams.get('view') || 'requests';
  const showOpenQueue = currentView !== 'assigned';
  const showAssignedQueue = currentView !== 'requests';

  const openQueue = incidents.filter((inc) => inc.status === 'open');
  const myMissions = incidents.filter((inc) =>
    (inc.status === 'assigned' || inc.status === 'in_progress') &&
    (inc.assignedTeamIds || []).includes(user?.id)
  );

  const handleAction = async (incidentId, status, nextTeamIds) => {
    const payload = { status };
    if (nextTeamIds) payload.assignedTeamIds = nextTeamIds;
    const result = await dispatch(updateSosIncident({ id: incidentId, payload }));
    if (updateSosIncident.fulfilled.match(result)) {
      setSelectedIncident(result.payload);
    }
  };

  const priorityColors = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-amber-100 text-amber-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-slate-100 text-slate-600'
  };

  const statusLabels = {
    open: 'Open',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };

  // Fake field stats that match the theme
  const fieldStatus = [
    { label: 'Current Zone', detail: 'North Response Corridor' },
    { label: 'Volunteers Deployed', detail: `${user?.name || 'Aegis Helper'} (Active)` },
    { label: 'System Sync', detail: 'Live connection established' }
  ];

  return (
    <>
      <PageHeader title="Helper and NGO Dashboard" description="Accept emergency calls, track assigned rescue operations, and coordinate field relief." />

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { id: 'requests', label: 'Emergency Requests', count: openQueue.length },
          { id: 'assigned', label: 'Assigned Missions', count: myMissions.length },
          { id: 'all', label: 'All Missions', count: openQueue.length + myMissions.length }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSearchParams({ view: tab.id })}
            className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${currentView === tab.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BadgeCheck} label="Assigned Missions" value={String(myMissions.length)} helper="Active responses" tone="danger" />
        <StatCard icon={Users} label="Open Requests" value={String(openQueue.length)} helper="Distress calls pending" tone="amber" />
        <StatCard icon={PackageCheck} label="Disaster Zone" value="Active" helper="North Relief Grid" tone="indigo" />
        <StatCard icon={MapPinned} label="Route Updates" value="Live" helper="Dynamic GPS active" tone="slate" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <StatusBoard title="Field Readiness" items={fieldStatus} />

          {showAssignedQueue && (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-indigo-600 animate-pulse" />
                Assigned Missions ({myMissions.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {myMissions.length === 0 ? (
                <p className="p-6 text-sm text-slate-500 text-center">No active missions assigned to you.</p>
              ) : (
                myMissions.map((inc) => (
                  <div key={inc.id} className="p-4 flex flex-col gap-3 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 transition-colors">
                    <div onClick={() => setSelectedIncident(inc)} className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-bold text-slate-900">{inc.disasterType}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {inc.location?.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${priorityColors[inc.severity]}`}>
                          {inc.severity}
                        </span>
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-black text-indigo-700 uppercase">
                          {statusLabels[inc.status]}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {inc.status === 'assigned' && (inc.assignedTeamIds || []).includes(user?.id) && (
                        <button
                          type="button"
                          onClick={() => handleAction(inc.id, 'in_progress')}
                          className="rounded-full bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition"
                        >
                          Start Rescue
                        </button>
                      )}
                      {inc.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleAction(inc.id, 'resolved')}
                          className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          )}

          {showOpenQueue && (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" />
                Emergency Requests Queue ({openQueue.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {openQueue.length === 0 ? (
                <p className="p-6 text-sm text-slate-500 text-center">No open distress calls in queue.</p>
              ) : (
                openQueue.map((inc) => (
                  <div key={inc.id} className="p-4 flex flex-col gap-3 border-b last:border-b-0 border-slate-100 hover:bg-slate-50 transition-colors">
                    <div onClick={() => setSelectedIncident(inc)} className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-bold text-slate-900">{inc.disasterType}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {inc.location?.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${priorityColors[inc.severity]}`}>
                          {inc.severity}
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800 uppercase">
                          {statusLabels[inc.status]}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleAction(inc.id, 'assigned', [...(inc.assignedTeamIds || []), user.id]); }}
                      className="self-start rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                    >
                      Accept Mission
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
          )}
        </div>

        <div className="space-y-6">
          {/* Incident Details Card */}
          {selectedIncident && (
            <section className="rounded-2xl border-2 border-indigo-100 bg-white p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
              <h3 className="font-black text-slate-950 text-lg flex items-center justify-between mb-4">
                <span>Mission Details</span>
                <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">×</button>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Emergency Type</p>
                  <p className="font-black text-slate-900 text-base mt-0.5">{selectedIncident.disasterType}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Description</p>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{selectedIncident.description}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                    {selectedIncident.location?.address}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Coords: {selectedIncident.location?.lat?.toFixed(5)}, {selectedIncident.location?.lng?.toFixed(5)}</p>
                </div>

                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Priority</p>
                    <span className={`inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${priorityColors[selectedIncident.severity]}`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status</p>
                    <span className="inline-block mt-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-700 uppercase">
                      {statusLabels[selectedIncident.status]}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {selectedIncident.status === 'open' && (
                    <button 
                      onClick={() => handleAction(selectedIncident.id, 'assigned', [...(selectedIncident.assignedTeamIds || []), user.id])}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <Navigation className="h-4 w-4 shrink-0" />
                      Accept Mission / Assign Me
                    </button>
                  )}
                  {selectedIncident.status === 'assigned' && (
                    <button 
                      onClick={() => handleAction(selectedIncident.id, 'in_progress')}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl shadow-lg shadow-amber-100 flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <Clock className="h-4 w-4 shrink-0" />
                      Start Rescue Operation
                    </button>
                  )}
                  {selectedIncident.status === 'in_progress' && (
                    <button 
                      onClick={() => handleAction(selectedIncident.id, 'resolved')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      Mark Rescue Resolved
                    </button>
                  )}
                  {selectedIncident.status === 'resolved' && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mission completed successfully.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <NotificationPanel compact />
          <ResourceSnapshot />
        </div>
      </div>
    </>
  );
}
