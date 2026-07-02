import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getDashboardAnalytics } from '../../services/analyticsDashboard.service.js';

export const getAnalytics = asyncHandler(async (_req, res) => {
  sendSuccess(res, await getDashboardAnalytics(), 'Analytics loaded');
});
