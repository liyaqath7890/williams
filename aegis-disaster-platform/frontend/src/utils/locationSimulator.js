const rescueZones = [
  { lat: 19.0902, lng: 72.8678, address: 'East Bank sector, Flood Zone A' },
  { lat: 19.076, lng: 72.8777, address: 'North depot access road' },
  { lat: 19.0821, lng: 72.8812, address: 'Central High School shelter perimeter' }
];

export function getSimulatedLocation() {
  const zone = rescueZones[Math.floor(Math.random() * rescueZones.length)];
  return {
    ...zone,
    lat: Number((zone.lat + randomOffset()).toFixed(6)),
    lng: Number((zone.lng + randomOffset()).toFixed(6))
  };
}

export function getBrowserLocation() {
  if (!navigator.geolocation) {
    return Promise.resolve(getSimulatedLocation());
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          address: 'Live browser location'
        });
      },
      () => resolve(getSimulatedLocation()),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

function randomOffset() {
  return (Math.random() - 0.5) * 0.012;
}
