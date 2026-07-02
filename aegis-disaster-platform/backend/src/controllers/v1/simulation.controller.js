import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { detectPanicKeywords, simulateDisasterPrediction } from '../../ai/prediction.service.js';
import { startDroneMission, stopDroneMission, getDroneStatus } from '../../drone/drone.service.js';

export const getAiPrediction = asyncHandler(async (req, res) => {
  const prediction = await simulateDisasterPrediction({
    rainfallMm: req.query.rainfallMm ? Number(req.query.rainfallMm) : undefined,
    windSpeedKmph: req.query.windSpeedKmph ? Number(req.query.windSpeedKmph) : undefined,
    seismicIndex: Number(req.query.seismicIndex || 1.2),
    lat: req.query.lat,
    lng: req.query.lng
  });
  sendSuccess(res, prediction, 'AI prediction simulation complete');
});

export const getDroneMission = asyncHandler(async (_req, res) => {
  const status = getDroneStatus();
  sendSuccess(res, status, 'Drone status retrieved');
});

export const launchDroneMission = asyncHandler(async (req, res) => {
  const { origin } = req.body;
  const result = startDroneMission(origin || [19.076, 72.8777]);
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }
  sendSuccess(res, result.mission, 'Drone mission launched');
});

export const stopDroneMissionRoute = asyncHandler(async (_req, res) => {
  const result = stopDroneMission();
  sendSuccess(res, result, 'Drone mission stopped');
});

export const postPanicDetection = asyncHandler(async (req, res) => {
  sendSuccess(res, detectPanicKeywords(req.body.text), 'Panic keyword simulation complete');
});
