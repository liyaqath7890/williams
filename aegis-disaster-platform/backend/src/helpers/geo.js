export function toGeoPoint({ lat, lng, address }) {
  return {
    lat: Number(lat),
    lng: Number(lng),
    address
  };
}
