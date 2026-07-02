import { getLiveWeather } from '../services/weather.service.js';

export async function simulateDisasterPrediction({ rainfallMm, windSpeedKmph, seismicIndex = 0, lat, lng }) {
  let weather = {};
  if (lat && lng) {
    weather = await getLiveWeather(lat, lng);
  }

  const finalRainfall = rainfallMm ?? weather.rainfallMm ?? 0;
  const finalWind = windSpeedKmph ?? weather.windSpeedKmph ?? 0;

  const score = finalRainfall * 0.45 + finalWind * 0.35 + seismicIndex * 20;

  return {
    score,
    riskLevel: score > 120 ? 'critical' : score > 80 ? 'high' : score > 40 ? 'moderate' : 'low',
    weatherContext: weather,
    recommendation: 'Validate simulation output with field intelligence before dispatch decisions.'
  };
}

export function detectPanicKeywords(text = '') {
  const keywords = ['trapped', 'bleeding', 'help', 'urgent', 'drowning', 'collapsed', 'fire', 'missing'];
  const normalized = text.toLowerCase();
  const matches = keywords.filter((keyword) => normalized.includes(keyword));

  return {
    matches,
    panicScore: Math.min(matches.length * 22, 100),
    priority: matches.length >= 3 ? 'critical' : matches.length >= 1 ? 'high' : 'normal'
  };
}
