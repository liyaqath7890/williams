import { Alert, MissingPerson, Resource, Shelter, SosIncident, User } from '../models/index.js';
import { sequelize } from '../config/sequelize.js';

export async function getDashboardAnalytics() {
  const [incidents, resolvedIncidents, users, shelters, resources, alerts, missing] = await Promise.all([
    SosIncident.count(),
    SosIncident.count({ where: { status: 'resolved' } }),
    User.count(),
    Shelter.count(),
    Resource.count(),
    Alert.count(),
    MissingPerson.count()
  ]);

  // Aggregate resources by category
  const resourceData = await Resource.findAll({
    attributes: ['category', [sequelize.fn('sum', sequelize.col('quantity')), 'value']],
    group: ['category']
  });
  
  const resourceMix = resourceData.map(r => ({
    name: r.get('category').charAt(0).toUpperCase() + r.get('category').slice(1),
    value: parseInt(r.get('value') || 0, 10)
  }));

  // Aggregate incidents by status and day (basic simulation since we can't easily do a cross-database day-of-week extraction without knowing exact dialect, let's just group by status as a stand-in or mock a live time series query)
  // Actually, we can fetch recent incidents and group them in JS to be safe across dialects.
  const recentIncidents = await SosIncident.findAll({
    attributes: ['createdAt', 'status'],
    order: [['createdAt', 'DESC']],
    limit: 100
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trendMap = {};
  
  // Initialize last 7 days
  for(let i=6; i>=0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendMap[days[d.getDay()]] = { incidents: 0, resolved: 0 };
  }

  recentIncidents.forEach(inc => {
    const day = days[new Date(inc.createdAt).getDay()];
    if (trendMap[day]) {
      trendMap[day].incidents++;
      if (inc.status === 'resolved') {
        trendMap[day].resolved++;
      }
    }
  });

  const incidentTrend = Object.keys(trendMap).map(day => ({
    name: day,
    incidents: trendMap[day].incidents,
    resolved: trendMap[day].resolved
  }));

  return {
    summary: {
      incidents,
      resolvedIncidents,
      activeMissions: Math.max(incidents - resolvedIncidents, 0),
      users,
      shelters,
      resources,
      alerts,
      missing
    },
    incidentTrend,
    resourceMix
  };
}
