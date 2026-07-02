export function summarizeIncidentMetrics(incidents = []) {
  return {
    total: incidents.length,
    open: incidents.filter((incident) => incident.status === 'open').length,
    resolved: incidents.filter((incident) => incident.status === 'resolved').length
  };
}
