import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { createSosIncident, listSosIncidents } from '../../services/sos.service.js';
import { createBroadcastNotification } from '../../services/notification.service.js';
import { emitSosCreated, emitSosUpdated } from '../../sockets/emitters.js';
import { SosIncident, User } from '../../models/index.js';

export const createSos = asyncHandler(async (req, res) => {
  const incident = await createSosIncident(req.user.id, req.validated.body);
  emitSosCreated(incident.toJSON());
  await createBroadcastNotification({
    title: 'New SOS alert',
    body: `${incident.disasterType} request requires immediate response near ${incident.location?.address || 'the shared location'}.`,
    type: 'sos',
    data: { sosId: incident.id, status: incident.status }
  });
  sendSuccess(res, incident, 'SOS incident created', 201);
});

export const listSos = asyncHandler(async (_req, res) => {
  const incidents = await listSosIncidents();
  sendSuccess(res, incidents, 'SOS incidents loaded');
});

export const updateSos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, assignedTeamIds } = req.body;
  
  const incident = await SosIncident.findByPk(id, {
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role'] }]
  });
  
  if (!incident) {
    const error = new Error('SOS incident not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (status) incident.status = status;
  if (assignedTeamIds) incident.assignedTeamIds = assignedTeamIds;
  await incident.save();
  
  const updatedJson = incident.toJSON();
  emitSosUpdated(updatedJson);
  sendSuccess(res, updatedJson, 'SOS incident updated');
});
