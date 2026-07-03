import React, { useEffect, useState, useRef } from 'react';
import { 
  Plane, 
  BatteryCharging, 
  RadioTower, 
  Navigation, 
  Target, 
  Activity, 
  Play, 
  RotateCcw, 
  ShieldAlert,
  Terminal,
  Wifi,
  Crosshair,
  Map as MapIcon,
  Search,
  ChevronRight,
  Minus,
  Plus
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useSocket } from '../../hooks/useSocket';
import { operationsService } from '../../services/operationsService';

// Fix for Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.25 });
  }, [center, map]);
  useEffect(() => {
    if (map.getZoom() !== zoom) {
      map.setZoom(zoom);
    }
  }, [zoom, map]);
  return null;
}

function DroneMapEvents({ onPlaceDrone }) {
  useMapEvents({
    click(event) {
      onPlaceDrone([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

const MIN_MAP_ZOOM = 3;
const MAX_MAP_ZOOM = 18;

const coordinatePattern = /@?(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/;

function parseCoordinates(query) {
  const match = query.match(coordinatePattern);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return [lat, lng];
}

function cleanSearchQuery(query) {
  return query
    .trim()
    .replace(/^https?:\/\/\S+/i, (url) => {
      try {
        return decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).join(' '));
      } catch {
        return url;
      }
    })
    .replace(/\s+/g, ' ');
}

function getSearchCandidates(query) {
  const cleanedQuery = cleanSearchQuery(query) || query.trim();
  const normalized = cleanedQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const candidates = [cleanedQuery];

  if (/\b(meeca|meca|mekka|mecca|makkah|kaaba|haram)\b/.test(normalized)) {
    candidates.push(
      'Mecca Saudi Arabia',
      'Makkah Saudi Arabia',
      'Masjid al-Haram Makkah Saudi Arabia',
    );
  }

  if (!/\b(india|usa|united states|saudi arabia|uae|dubai|uk|canada|australia)\b/.test(normalized)) {
    candidates.push(`${cleanedQuery} city`, `${cleanedQuery} landmark`);
  }

  return [...new Set(candidates.filter(Boolean))];
}

function getKnownPlaceFallback(query) {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (/\b(meeca|meca|mekka|mecca|makkah|kaaba|haram)\b/.test(normalized)) {
    return {
      coords: [21.422487, 39.826206],
      label: 'Masjid al-Haram, Mecca / Makkah, Saudi Arabia',
    };
  }
  return null;
}

function formatNominatimResult(result) {
  return result.display_name || [result.name, result.type, result.address?.city, result.address?.country].filter(Boolean).join(', ');
}

function formatPhotonResult(feature) {
  const props = feature.properties || {};
  return [props.name, props.street, props.city, props.state, props.country].filter(Boolean).join(', ');
}

const DroneSimulationPage = () => {
  const [status, setStatus] = useState('Standby'); 
  const [battery, setBattery] = useState(100);
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [logs, setLogs] = useState(['[SYSTEM] Aegis Drone v4.2 Initialized.', '[SYSTEM] GPS Lock Acquired.']);
  const [activeWaypoint, setActiveWaypoint] = useState(0);
  
  // Geolocation State
  const [searchQuery, setSearchQuery] = useState('');
  const [targetAddress, setTargetAddress] = useState('Current browser location');
  const [currentPos, setCurrentPos] = useState([19.0760, 72.8777]); 
  const [dronePos, setDronePos] = useState([19.0760, 72.8777]);
  const [zoom, setZoom] = useState(16);
  const [isSearching, setIsSearching] = useState(false);
  
  useSocket('DRONE_TELEMETRY', (m) => {
    setStatus(m.status);
    setAltitude(m.altitude);
    setSpeed(m.speed);
    setBattery(m.battery);
    setDronePos(m.currentPos);
    
    // Add logs based on status
    if (m.status !== status && m.status !== 'Standby') {
      addLog(`Status changed to: ${m.status}`);
      if (m.status === 'Launching') setZoom(MAX_MAP_ZOOM);
      if (m.status === 'RTL') setZoom(14);
    }
  });

  const zoomIn = () => {
    setZoom((currentZoom) => Math.min(MAX_MAP_ZOOM, currentZoom + 1));
  };

  const zoomOut = () => {
    setZoom((currentZoom) => Math.max(MIN_MAP_ZOOM, currentZoom - 1));
  };

  const placeDroneAt = (coords, label = 'Selected map location') => {
    setCurrentPos(coords);
    setDronePos(coords);
    setTargetAddress(label);
    addLog(`Drone set to: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`);
  };

  const waypoints = [
    { name: 'Launchpad Delta', action: 'Takeoff', alt: 120 },
    { name: 'Target Perimeter', action: 'Scanning Terrain', alt: 150 },
    { name: 'Critical Corridor', action: 'Thermal Inspection', alt: 100 },
    { name: 'Secondary Sector', action: 'Search for Victims', alt: 80 },
    { name: 'Command Base', action: 'Land', alt: 0 },
  ];

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  // Get user's real location initially
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        placeDroneAt([latitude, longitude], 'Current browser location');
        addLog(`Initial GPS Lock: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      });
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return;
    
    setIsSearching(true);
    addLog(`Searching for target zone: "${rawQuery}"...`);
    
    try {
      const parsedCoords = parseCoordinates(rawQuery);
      if (parsedCoords) {
        placeDroneAt(parsedCoords, `Coordinates: ${parsedCoords[0].toFixed(6)}, ${parsedCoords[1].toFixed(6)}`);
        setZoom(17);
        addLog('Target Found: coordinates detected from search.');
        addLog(`Relocating drone to target coordinates.`);
        return;
      }

      const searchCandidates = getSearchCandidates(rawQuery);

      for (const candidate of searchCandidates) {
        const nominatimParams = new URLSearchParams({
          format: 'jsonv2',
          q: candidate,
          limit: '5',
          addressdetails: '1',
          dedupe: '1',
          namedetails: '1',
          'accept-language': 'en',
        });
        const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?${nominatimParams.toString()}`);
        const nominatimData = nominatimResponse.ok ? await nominatimResponse.json() : [];
        const nominatimMatch = nominatimData.find((item) => item.lat && item.lon);

        if (nominatimMatch) {
          const newCoords = [parseFloat(nominatimMatch.lat), parseFloat(nominatimMatch.lon)];
          const label = formatNominatimResult(nominatimMatch);
          placeDroneAt(newCoords, label);
          setSearchQuery(label);
          setZoom(17);
          addLog(`Target Found: ${label}`);
          addLog(`Relocating drone to target coordinates.`);
          return;
        }
      }

      for (const candidate of searchCandidates) {
        const photonParams = new URLSearchParams({ q: candidate, limit: '5', lang: 'en' });
        const photonResponse = await fetch(`https://photon.komoot.io/api/?${photonParams.toString()}`);
        const photonData = photonResponse.ok ? await photonResponse.json() : { features: [] };
        const photonMatch = photonData.features?.find((feature) => feature.geometry?.coordinates?.length >= 2);

        if (photonMatch) {
          const [lng, lat] = photonMatch.geometry.coordinates;
          const label = formatPhotonResult(photonMatch) || candidate;
          placeDroneAt([lat, lng], label);
          setSearchQuery(label);
          setZoom(17);
          addLog(`Target Found: ${label}`);
          addLog(`Relocating drone to target coordinates.`);
          return;
        }
      }

      const knownPlace = getKnownPlaceFallback(rawQuery);
      if (knownPlace) {
        placeDroneAt(knownPlace.coords, knownPlace.label);
        setSearchQuery(knownPlace.label);
        setZoom(17);
        addLog(`Target Found: ${knownPlace.label}`);
        addLog(`Relocating drone to target coordinates.`);
        return;
      }

      addLog('ERROR: Target location not found. Try adding city, state, or country.');
    } catch (error) {
      addLog('ERROR: Connection to satellite database failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLaunch = async () => {
    if (status !== 'Standby' && status !== 'Landed') return;
    try {
      await operationsService.launchDroneMission({ origin: currentPos });
      addLog('Mission launch requested from Command Center.');
    } catch (e) {
      addLog('Failed to launch mission: ' + e.message);
    }
  };

  const handleReset = async () => {
    try {
      await operationsService.stopDroneMission();
      setStatus('Standby');
      setBattery(100);
      setAltitude(0);
      setSpeed(0);
      setDistance(0);
      setActiveWaypoint(0);
      setDronePos(currentPos);
      setZoom(17);
      setLogs(['[SYSTEM] Ready for new mission at target location.']);
    } catch (e) {
      addLog('Failed to reset mission.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader 
          title="Target Reconnaissance" 
          description="Search any location worldwide, set the drone there, and inspect the surrounding satellite map freely." 
        />
        <div className="flex w-full gap-3 sm:w-auto">
          <button onClick={handleReset} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition-all hover:bg-slate-50 active:scale-95">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLaunch}
            disabled={status !== 'Standby'}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold shadow-xl transition-all sm:flex-none sm:px-8 ${
              status === 'Standby' 
                ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            Launch Mission
          </button>
        </div>
      </div>

      {/* Target Search Bar */}
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:flex-row">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <form onSubmit={handleSearch}>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter target location (e.g. Mumbai, New York, or specific address)..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-950 caret-slate-950 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        </div>
        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-black active:scale-95 disabled:opacity-50 md:w-auto"
        >
          {isSearching ? 'Locating...' : 'Set Drone'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Plane} label="Drone Link" value={status} tone={status === 'Surveying' ? 'indigo' : 'slate'} />
        <StatCard icon={BatteryCharging} label="Battery" value={`${battery.toFixed(1)}%`} tone={battery < 20 ? 'danger' : 'indigo'} />
        <StatCard icon={MapIcon} label="Target Lock" value={searchQuery ? 'Custom' : 'Local'} helper={`${dronePos[0].toFixed(5)}, ${dronePos[1].toFixed(5)}`} tone="indigo" />
        <StatCard icon={Wifi} label="Link Strength" value="98.4dB" tone="indigo" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px] xl:gap-8">
        <div className="space-y-6 min-w-0">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <MapIcon className="mt-0.5 h-5 w-5 flex-none text-indigo-600" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Complete Target Location</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{targetAddress}</p>
                </div>
              </div>
              <div className="flex w-full flex-none items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= MIN_MAP_ZOOM}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition-all hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="min-w-20 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-black text-slate-900 sm:flex-none">
                  {zoom}x
                </div>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= MAX_MAP_ZOOM}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-sm transition-all hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-3xl border-4 border-slate-800 bg-black p-1.5 shadow-2xl sm:h-[550px] sm:rounded-[40px] sm:p-2">
            
            <MapContainer 
              center={dronePos} 
              zoom={zoom} 
              minZoom={MIN_MAP_ZOOM}
              maxZoom={MAX_MAP_ZOOM}
              className="h-full w-full overflow-hidden rounded-2xl sm:rounded-[32px]"
              zoomControl={true}
              dragging={true}
              touchZoom={true}
              doubleClickZoom={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Satellite imagery &copy; Esri"
                maxZoom={MAX_MAP_ZOOM}
                maxNativeZoom={MAX_MAP_ZOOM}
              />
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                attribution="Routes &copy; Esri"
                maxZoom={MAX_MAP_ZOOM}
                maxNativeZoom={MAX_MAP_ZOOM}
                opacity={0.8}
              />
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution="Labels &copy; Esri"
                maxZoom={MAX_MAP_ZOOM}
                maxNativeZoom={MAX_MAP_ZOOM}
                opacity={0.9}
              />
              <MapUpdater center={dronePos} zoom={zoom} />
              <DroneMapEvents onPlaceDrone={placeDroneAt} />
              <Marker position={dronePos}>
                <Popup>
                  <strong>Target location</strong>
                  <br />
                  {targetAddress}
                  <br />
                  {dronePos[0].toFixed(6)}, {dronePos[1].toFixed(6)}
                </Popup>
              </Marker>
            </MapContainer>

            <div className="absolute inset-0 pointer-events-none z-10">
               <div className="absolute inset-0 border-[18px] border-black/25 sm:border-[40px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.28)_100%)]" />
              
              {status === 'Surveying' && (
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/10 animate-pulse" />
              )}

              <div className="absolute inset-0 flex items-center justify-center">
                <Crosshair className={`h-14 w-14 text-white/40 transition-all sm:h-20 sm:w-20 ${status === 'Surveying' ? 'scale-110' : 'scale-100'}`} />
              </div>

              <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3 font-mono sm:left-10 sm:right-10 sm:top-10">
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/70 p-3 text-white shadow-2xl backdrop-blur-xl sm:gap-8 sm:p-5">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">ALT</p>
                    <p className="text-base font-bold sm:text-2xl">{altitude}m</p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">SPD</p>
                    <p className="text-base font-bold sm:text-2xl">{speed.toFixed(1)}<span className="text-xs text-slate-400">km/h</span></p>
                  </div>
                  <div className="hidden h-10 w-px bg-white/10 sm:block" />
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">DST</p>
                    <p className="text-2xl font-bold">{distance.toFixed(2)}<span className="text-xs text-slate-400">km</span></p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-white shadow-lg shadow-indigo-900/50 sm:px-4 sm:text-[10px] sm:tracking-[0.2em]">
                    <div className={`w-2 h-2 bg-white rounded-full ${status === 'Surveying' ? 'animate-pulse' : 'opacity-50'}`} />
                    Tactical Feed
                  </div>
                  <div className="hidden rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md sm:block">
                    HD: 4K RES
                  </div>
                </div>
              </div>

              <div className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10">
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500/20 bg-black/40 sm:h-24 sm:w-24">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-spin duration-[4000ms]" />
                  <Target className="w-6 h-6 text-indigo-400 opacity-60" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-600" />
                Mission Waypoints
              </h3>
              <div className="space-y-3">
                {waypoints.map((wp, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    i === activeWaypoint ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 opacity-60'
                  }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      i <= activeWaypoint ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${i === activeWaypoint ? 'text-indigo-900' : 'text-slate-600'}`}>{wp.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{wp.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Local Analytics
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Cloud Coverage', val: 'Minimal', color: 'text-emerald-600' },
                  { label: 'Ground Texture', val: 'Clear', color: 'text-indigo-600' },
                  { label: 'Thermal Sig', val: 'Searching...', color: 'text-slate-600' },
                  { label: 'Encryption', val: 'AES-256', color: 'text-indigo-600' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    <span className={`text-xs font-black ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[460px] flex-col rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl sm:h-[600px] sm:p-6 xl:h-[750px] xl:p-8">
          <div className="mb-5 flex items-center gap-2 text-indigo-500 sm:mb-8">
            <Terminal className="w-5 h-5" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Satellite Command Console</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 font-mono text-[11px] custom-scrollbar pr-3">
            {logs.map((log, i) => (
              <div key={i} className={`p-3 rounded-xl border-l-4 ${
                log.includes('SYSTEM') ? 'text-indigo-300 border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-slate-800 bg-white/5'
              }`}>
                {log}
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-800 pt-5 sm:mt-8 sm:pt-8">
            <p className="text-[9px] text-slate-600 italic text-center font-bold tracking-widest">
              SYSTEM CONNECTED TO GLOBAL SAT-NET
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DroneSimulationPage;
