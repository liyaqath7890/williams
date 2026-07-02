export function runPredictionSimulation(signal = {}) {
  return {
    riskLevel: signal.rainfallMm > 120 ? 'high' : 'moderate',
    confidence: 0.72,
    recommendation: 'Dispatch assessment teams and verify shelter capacity.'
  };
}
