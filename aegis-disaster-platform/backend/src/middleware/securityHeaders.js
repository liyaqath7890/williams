export function securityHeaders(_req, res, next) {
  res.setHeader('X-Aegis-Platform', 'Disaster-Response');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  next();
}
