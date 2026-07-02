import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { createAlert, deleteAlert, listAlerts } from '../../services/alert.service.js';
import { createBroadcastNotification } from '../../services/notification.service.js';
import { emitAlertBroadcast, emitAlertDeleted } from '../../sockets/emitters.js';

export const publishAlert = asyncHandler(async (req, res) => {
  const alert = await createAlert(req.user.id, req.body);
  await createBroadcastNotification({
    title: alert.title,
    body: alert.message,
    type: `alert:${alert.severity}`,
    data: { alertId: alert.id, region: alert.region, audience: alert.audience }
  });
  emitAlertBroadcast(alert);
  sendSuccess(res, alert, 'Alert published', 201);
});

export const getAlerts = asyncHandler(async (_req, res) => {
  const alerts = await listAlerts();
  sendSuccess(res, alerts, 'Alerts loaded');
});

export const removeAlert = asyncHandler(async (req, res) => {
  const result = await deleteAlert(req.params.id);
  emitAlertDeleted(req.params.id);
  sendSuccess(res, result, 'Alert deleted');
});
