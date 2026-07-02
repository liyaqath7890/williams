import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, BellRing, LocateFixed, MapPin, RadioTower, Siren } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import EmergencyOverlay from '../../components/emergency/EmergencyOverlay';
import { createSos, fetchSosIncidents, setSirenActive } from '../../redux/features/sos/sosSlice';
import { getBrowserLocation, getSimulatedLocation } from '../../utils/locationSimulator';
import { useEmergencySiren } from '../../hooks/useEmergencySiren';

const disasterTypes = ['Flood rescue', 'Medical emergency', 'Fire outbreak', 'Building collapse', 'Food and water emergency'];

export default function SosPage() {
  const dispatch = useDispatch();
  const { activeIncident, error, incidents, sirenActive, status } = useSelector((state) => state.sos);
  const { start, stop } = useEmergencySiren();
  const [form, setForm] = useState({
    disasterType: 'Flood rescue',
    severity: 'critical',
    description: 'Immediate rescue help needed. Location shared from Aegis SOS panel.'
  });
  const [location, setLocation] = useState(getSimulatedLocation());
  const [overlayVisible, setOverlayVisible] = useState(false);

  const isLoading = status === 'loading';
  const latestIncidents = useMemo(() => incidents.slice(0, 4), [incidents]);

  useEffect(() => {
    dispatch(fetchSosIncidents());
  }, [dispatch]);

  useEffect(() => {
    if (sirenActive) {
      start();
      return;
    }

    stop();
  }, [sirenActive, start, stop]);

  useEffect(() => () => stop(), [stop]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleLocate = async () => {
    const nextLocation = await getBrowserLocation();
    setLocation(nextLocation);
  };

  const handleSimulateLocation = () => {
    setLocation(getSimulatedLocation());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(setSirenActive(true));
    const result = await dispatch(createSos({ ...form, location }));

    if (createSos.fulfilled.match(result)) {
      setOverlayVisible(true);
    }
  };

  const handleCloseOverlay = () => {
    setOverlayVisible(false);
    dispatch(setSirenActive(false));
  };

  return (
    <>
      <PageHeader title="SOS Emergency System" description="Transmit a high-priority rescue request with location, severity, and real-time authority alerting." />

      <EmergencyOverlay incident={activeIncident} onClose={handleCloseOverlay} visible={overlayVisible} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-red-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-red-700">
                <Siren className="h-5 w-5" />
                <h3 className="text-lg font-bold">Emergency Dispatch</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">Use only for active rescue, medical, shelter, or survival assistance needs.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${sirenActive ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
              {sirenActive ? 'Siren active' : 'Ready'}
            </span>
          </div>

          {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Emergency type</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                name="disasterType"
                onChange={handleChange}
                value={form.disasterType}
              >
                {disasterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Severity</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                name="severity"
                onChange={handleChange}
                value={form.severity}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Situation note</span>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                name="description"
                onChange={handleChange}
                value={form.description}
              />
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin className="h-4 w-4 text-aegis-primary" />
                Shared location
              </div>
              <p className="mt-2 text-sm text-slate-600">{location.address}</p>
              <p className="mt-1 text-xs text-slate-500">
                {location.lat}, {location.lng}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700" onClick={handleLocate} type="button">
                  <LocateFixed className="h-4 w-4" />
                  Use my location
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700" onClick={handleSimulateLocation} type="button">
                  <RadioTower className="h-4 w-4" />
                  Simulate location
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md bg-aegis-danger px-5 py-3 font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoading}
                type="submit"
              >
                <AlertTriangle className="h-5 w-5" />
                {isLoading ? 'Transmitting...' : 'Trigger SOS'}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700"
                onClick={() => dispatch(setSirenActive(!sirenActive))}
                type="button"
              >
                <BellRing className="h-5 w-5" />
                {sirenActive ? 'Stop siren' : 'Test siren'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-950">Emergency Protocol</h3>
            <div className="mt-4 grid gap-3">
              {['Stay visible and conserve phone battery.', 'Move away from unstable structures or flood current.', 'Keep the SOS page open for live updates.', 'Respond to authority chat when assigned.'].map((item) => (
                <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="font-bold text-slate-950">Recent SOS Signals</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {latestIncidents.length === 0 ? (
                <p className="px-4 py-4 text-sm text-slate-500">No SOS incidents loaded yet.</p>
              ) : (
                latestIncidents.map((incident) => (
                  <article key={incident.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{incident.disasterType}</p>
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">{incident.severity}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{incident.location?.address || 'Shared location'}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
