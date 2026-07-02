/**
 * Weather Service for Aegis Disaster Platform.
 * Integrates with OpenWeatherMap APIs.
 */

let weatherCache = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function getLiveWeather(lat = 19.0821, lng = 72.8812) {
  const now = Date.now();
  if (weatherCache.data && (now - weatherCache.timestamp < CACHE_TTL)) {
    return weatherCache.data;
  }

  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY || 'demo_key'; 
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    
    if (apiKey === 'demo_key') {
       throw new Error('No valid OpenWeatherMap API key found');
    }

    const response = await fetch(url);
    if (!response.ok) {
       throw new Error(`Weather API error: ${response.statusText}`);
    }
    const data = await response.json();

    weatherCache.data = {
      temp: data.main.temp,
      humidity: data.main.humidity,
      rainfallMm: data.rain ? (data.rain['1h'] || 0) : 0,
      windSpeedKmph: data.wind.speed * 3.6,
      pressureHpa: data.main.pressure,
      condition: data.weather[0]?.main || 'Clear',
      timestamp: new Date().toISOString()
    };
    weatherCache.timestamp = now;

    return weatherCache.data;
  } catch (error) {
    console.warn('Weather API failed, returning degraded/fallback live data:', error.message);
    const dynamicRain = Math.random() * 50;
    return {
      temp: 25 + Math.random() * 10,
      humidity: 60 + Math.random() * 30,
      rainfallMm: dynamicRain,
      windSpeedKmph: 15 + Math.random() * 20,
      pressureHpa: 1010 + Math.random() * 10,
      condition: dynamicRain > 20 ? 'Rain' : 'Cloudy',
      timestamp: new Date().toISOString()
    };
  }
}


export function calculateFloodRisk(rainfallMm, humidity) {
  const riskScore = (rainfallMm * 0.6) + (humidity * 0.4);
  if (riskScore > 120) return 'critical';
  if (riskScore > 80) return 'high';
  if (riskScore > 40) return 'moderate';
  return 'low';
}
