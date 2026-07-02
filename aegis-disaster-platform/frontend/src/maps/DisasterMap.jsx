import React, { useEffect, useState, useCallback } from 'react';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { operationsService } from '../services/operationsService';
import { fetchSosIncidents, addIncident, updateIncident } from '../redux/features/sos/sosSlice';
import { socket } from '../sockets/socketClient';
import { SOCKET_EVENTS } from '../sockets/socketEvents';

const center = [19.0821, 72.8777];

// Standard Leaflet marker icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DisasterMap() {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state) => state.sos);
  const { user } = useSelector((state) => state.auth);
  
  const [shelters, setShelters] = useState([]);
  const [resources, setResources] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [userPos, setUserPos] = useState(center);

  const loadShelters = useCallback(() => {
    operationsService.listShelters()
      .then(res => {
        const data = res.data?.data;
        setShelters(Array.isArray(data) ? data : (data?.rows || []));
      })
      .catch(console.error);
  }, []);

  const loadResources = useCallback(() => {
    if (['admin', 'authority'].includes(user?.role)) {
      operationsService.listResources()
        .then(res => {
          const data = res.data?.data;
          setResources(Array.isArray(data) ? data : (data?.inventory || []));
        })
        .catch(console.error);
    }
  }, [user]);

  const loadHelpers = useCallback(() => {
    if (['admin', 'authority'].includes(user?.role)) {
      operationsService.listHelpers()
        .then(res => {
          setHelpers(res.data?.data || []);
        })
        .catch(console.error);
    }
  }, [user]);

  // Find user's location initially
  useEffect(() => {
    if (user?.location?.lat && user?.location?.lng) {
      setUserPos([user.location.lat, user.location.lng]);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          
          // Broadcast current helper location via socket
          if (user?.role === 'helper') {
            socket.emit(SOCKET_EVENTS.TRACKING_UPDATE, {
              userId: user.id,
              name: user.name,
              role: user.role,
              location: { lat: coords[0], lng: coords[1] }
            });
          }
        },
        () => console.log("Using default center for map location")
      );
    }
  }, [user]);

  // Load all initial map data
  useEffect(() => {
    dispatch(fetchSosIncidents());
    loadShelters();
    loadResources();
    loadHelpers();
  }, [dispatch, loadShelters, loadResources, loadHelpers]);

  // Register real-time Socket.IO synchronization listeners
  useEffect(() => {
    const handleSosCreated = (inc) => dispatch(addIncident(inc));
    const handleAssignmentChanged = (inc) => dispatch(updateIncident(inc));
    const handleShelterChanged = () => loadShelters();
    const handleResourceChanged = () => loadResources();
    
    const handleTrackingUpdate = (payload) => {
      if (['admin', 'authority'].includes(user?.role) && payload.userId) {
        setHelpers(prev => {
          const exists = prev.some(h => h.id === payload.userId);
          if (exists) {
            return prev.map(h => h.id === payload.userId ? { ...h, location: payload.location } : h);
          } else {
            return [...prev, { id: payload.userId, name: payload.name, role: payload.role, location: payload.location, isAvailable: true }];
          }
        });
      }
    };

    socket.on(SOCKET_EVENTS.SOS_CREATED, handleSosCreated);
    socket.on(SOCKET_EVENTS.ASSIGNMENT_CHANGED, handleAssignmentChanged);
    socket.on(SOCKET_EVENTS.SHELTER_CHANGED, handleShelterChanged);
    socket.on(SOCKET_EVENTS.RESOURCE_CHANGED, handleResourceChanged);
    socket.on(SOCKET_EVENTS.TRACKING_UPDATE, handleTrackingUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.SOS_CREATED, handleSosCreated);
      socket.off(SOCKET_EVENTS.ASSIGNMENT_CHANGED, handleAssignmentChanged);
      socket.off(SOCKET_EVENTS.SHELTER_CHANGED, handleShelterChanged);
      socket.off(SOCKET_EVENTS.RESOURCE_CHANGED, handleResourceChanged);
      socket.off(SOCKET_EVENTS.TRACKING_UPDATE, handleTrackingUpdate);
    };
  }, [dispatch, loadShelters, loadResources, user]);

  // Find if this helper has an assigned mission
  const activeMission = user?.role === 'helper' 
    ? incidents.find(inc => (inc.status === 'assigned' || inc.status === 'in_progress') && (inc.assignedTeamIds || []).includes(user.id))
    : null;

  return (
    <MapContainer center={userPos} zoom={13} className="h-[420px] rounded-lg border border-slate-200 sm:h-[520px] lg:h-[620px] z-10">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Render Current User Marker */}
      {userPos && (
        <CircleMarker 
          center={userPos} 
          radius={8} 
          pathOptions={{ color: '#0284c7', fillColor: '#0ea5e9', fillOpacity: 0.8 }}
        >
          <Popup>
            <strong>Your Current Position</strong>
            <br />
            {user?.name || 'User'} ({user?.role})
          </Popup>
        </CircleMarker>
      )}

      {/* Render Shelters */}
      {shelters.map((shelter) => (
        <Marker key={shelter.id} position={[shelter.location?.lat || center[0], shelter.location?.lng || center[1]]}>
          <Popup>
            <div className="space-y-1">
              <strong className="text-slate-900 font-bold">{shelter.name}</strong>
              <p className="text-xs text-slate-500">{shelter.location?.address}</p>
              <div className="text-xs font-semibold mt-1">
                Occupancy: {shelter.occupancy} / {shelter.capacity}
              </div>
              <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                shelter.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {shelter.status}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render Incidents / Disaster locations */}
      {incidents.map((incident) => {
        const incidentLat = incident.location?.lat || center[0];
        const incidentLng = incident.location?.lng || center[1];
        
        // Don't render resolved/closed incidents on the map
        if (['resolved', 'closed'].includes(incident.status)) return null;

        return (
          <Circle
            center={[incidentLat, incidentLng]}
            key={incident.id}
            pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.18 }}
            radius={incident.severity === 'critical' ? 950 : incident.severity === 'high' ? 700 : 450}
          >
            <Popup>
              <div className="space-y-1">
                <strong className="text-red-700 font-black">{incident.disasterType}</strong>
                <p className="text-xs text-slate-600 font-medium">{incident.description}</p>
                <p className="text-[10px] text-slate-400 mt-1">Status: {incident.status} · Priority: {incident.severity}</p>
              </div>
            </Popup>
          </Circle>
        );
      })}

      {/* Render Helper routing to assigned victim */}
      {activeMission && activeMission.location?.lat && (
        <>
          <Marker position={[activeMission.location.lat, activeMission.location.lng]}>
            <Popup>
              <div className="space-y-1">
                <strong className="text-red-600 font-bold">Assigned Rescue Target</strong>
                <p className="text-xs">{activeMission.location.address}</p>
              </div>
            </Popup>
          </Marker>
          <Polyline 
            positions={[userPos, [activeMission.location.lat, activeMission.location.lng]]}
            pathOptions={{ color: '#6d28d9', weight: 4, dashArray: '8, 8', lineCap: 'round' }}
          />
        </>
      )}

      {/* Admin / Authority oversight layers */}
      {['admin', 'authority'].includes(user?.role) && (
        <>
          {/* Render Resources */}
          {resources.map((res) => {
            const resLat = res.location?.lat;
            const resLng = res.location?.lng;
            if (!resLat || !resLng) return null;
            return (
              <CircleMarker 
                key={res.id} 
                center={[resLat, resLng]} 
                radius={6}
                pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.8 }}
              >
                <Popup>
                  <div className="space-y-0.5">
                    <strong className="text-emerald-700 font-bold">{res.name}</strong>
                    <p className="text-xs font-semibold">Qty: {res.quantity} {res.unit}</p>
                    <p className="text-[10px] text-slate-400">Category: {res.category} · Status: {res.status}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Render Helpers */}
          {helpers.map((h) => {
            const helperLat = h.location?.lat;
            const helperLng = h.location?.lng;
            // Don't render the current logged in helper again as they are already rendered
            if (!helperLat || !helperLng || h.id === user.id) return null;
            return (
              <CircleMarker 
                key={h.id} 
                center={[helperLat, helperLng]} 
                radius={6}
                pathOptions={{ color: '#7c3aed', fillColor: '#8b5cf6', fillOpacity: 0.8 }}
              >
                <Popup>
                  <div className="space-y-0.5">
                    <strong className="text-violet-700 font-bold">{h.name}</strong>
                    <p className="text-[10px] text-slate-500">Contact: {h.phone || 'N/A'}</p>
                    <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      h.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {h.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </>
      )}

    </MapContainer>
  );
}
