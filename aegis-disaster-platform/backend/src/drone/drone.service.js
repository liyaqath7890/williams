import { getSocketServer } from '../sockets/emitters.js';

let activeMission = null;
let telemetryInterval = null;

export function startDroneMission(origin, targets = []) {
  if (activeMission) return { success: false, message: 'Mission already active' };
  
  activeMission = {
    origin,
    targets,
    currentPos: [...origin],
    altitude: 0,
    speed: 0,
    battery: 100,
    status: 'Launching',
    step: 0
  };

  telemetryInterval = setInterval(() => {
    updateTelemetry();
  }, 2000);

  return { success: true, mission: activeMission };
}

export function stopDroneMission() {
  if (telemetryInterval) clearInterval(telemetryInterval);
  activeMission = null;
  telemetryInterval = null;
  return { success: true };
}

export function getDroneStatus() {
  return activeMission || { status: 'Standby' };
}

function updateTelemetry() {
  if (!activeMission) return;

  const m = activeMission;
  m.step++;

  if (m.status === 'Launching') {
    m.altitude += 20;
    if (m.altitude >= 120) {
      m.status = 'Surveying';
    }
  } else if (m.status === 'Surveying') {
    m.currentPos[0] += 0.0002;
    m.currentPos[1] += 0.0002;
    m.speed = 45 + Math.random() * 5;
    m.battery = Math.max(0, m.battery - 0.5);
    
    if (m.step > 20) {
      m.status = 'RTL';
    }
  } else if (m.status === 'RTL') {
    m.altitude = Math.max(0, m.altitude - 20);
    m.speed = 0;
    if (m.altitude === 0) {
      m.status = 'Landed';
      clearInterval(telemetryInterval);
    }
  }

  // Emit to all connected clients
  const io = getSocketServer();
  if (io) {
    io.emit('DRONE_TELEMETRY', m);
  }
}

