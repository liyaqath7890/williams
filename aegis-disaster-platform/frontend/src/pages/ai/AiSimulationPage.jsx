import { useEffect, useState } from 'react';
import { Brain, Route, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { runPredictionSimulation } from '../../ai/predictionSimulator';
import { operationsService } from '../../services/operationsService';

export default function AiSimulationPage() {
  const [prediction, setPrediction] = useState(runPredictionSimulation({ rainfallMm: 135 }));
  const [panicText, setPanicText] = useState('Help, two people are trapped near a collapsed wall and need urgent rescue.');
  const [panic, setPanic] = useState({ matches: ['help', 'trapped', 'collapsed', 'urgent'], panicScore: 88, priority: 'critical' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    operationsService.getAiPrediction()
      .then((response) => {
        setPrediction(response.data.data);
      })
      .catch((err) => {
        console.warn('Backend AI Prediction service offline. Using offline simulation data.', err);
        setError('AI prediction services are currently offline or degraded. Showing local simulation data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePanicCheck = async () => {
    try {
      const response = await operationsService.detectPanic({ text: panicText });
      if (response) setPanic(response.data.data);
    } catch (err) {
      console.warn('Backend Panic Detection service offline. Using local logic.', err);
      // Fallback local offline parser
      const matches = ['help', 'trapped', 'collapsed', 'urgent'].filter(w => panicText.toLowerCase().includes(w));
      const score = matches.length > 0 ? Math.min(100, 20 + matches.length * 20) : 0;
      const priority = score > 75 ? 'critical' : score > 50 ? 'high' : score > 25 ? 'medium' : 'low';
      setPanic({ matches, panicScore: score, priority });
    }
  };

  return (
    <>
      <PageHeader title="AI Prediction Simulation" description="Simulate flood risk, safe route recommendation, danger-zone scoring, and panic keyword detection." />
      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          ⚠️ {error}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={ShieldAlert} label="Risk Level" value={prediction.riskLevel} tone={prediction.riskLevel === 'critical' ? 'danger' : 'amber'} />
        <StatCard icon={Brain} label="Confidence" value={`${Math.round((prediction.confidence || 0.72) * 100)}%`} />
        <StatCard icon={Route} label="Route Advice" value="Safe" helper="Avoid danger corridors" tone="slate" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-950">Prediction Output</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{prediction.recommendation}</p>
          <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            Danger zone score uses rainfall, wind speed, and seismic inputs. This is a simulation layer ready for real ML services later.
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-950">Panic Keyword Detection</h3>
          <textarea className="mt-4 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setPanicText(event.target.value)} value={panicText} />
          <button className="mt-3 rounded-md bg-aegis-primary px-4 py-2 font-semibold text-white" onClick={handlePanicCheck} type="button">Analyze Message</button>
          <div className="mt-4 rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            Priority: <strong>{panic.priority || (panic.isPanic ? 'high' : 'low')}</strong> · Score: <strong>{panic.panicScore || (panic.confidence ? Math.round(panic.confidence * 100) : 0)}</strong> · Matches: {(panic.matches || []).join(', ') || 'none'}
          </div>
        </section>

        {prediction.weatherContext && (
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-950">Live Weather Intelligence</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500 uppercase font-bold">Rainfall</p>
                <p className="text-lg font-bold text-slate-900">{prediction.weatherContext.rainfallMm?.toFixed(1)} mm</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500 uppercase font-bold">Wind Speed</p>
                <p className="text-lg font-bold text-slate-900">{prediction.weatherContext.windSpeedKmph} km/h</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500 uppercase font-bold">Condition</p>
                <p className="text-lg font-bold text-slate-900">{prediction.weatherContext.condition}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500 uppercase font-bold">Humidity</p>
                <p className="text-lg font-bold text-slate-900">{prediction.weatherContext.humidity}%</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400 italic">Data source: Simulated Weather Intelligence Module</p>
          </section>
        )}
      </div>
    </>
  );
}
