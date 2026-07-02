import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { env } from '../../config/env.js';
import { loginUser, refreshAuthSession, registerUser, revokeAuthSession, verifyEmailToken } from '../../services/auth.service.js';
import { User } from '../../models/User.js';

export const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.validated.body, getRequestContext(req));
  setRefreshCookie(req, res, data.refreshToken);
  sendSuccess(
    res,
    { user: data.user, accessToken: data.accessToken, verificationToken: data.verificationToken },
    'Registered successfully',
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.validated.body, getRequestContext(req));
  setRefreshCookie(req, res, data.refreshToken);
  sendSuccess(res, { user: data.user, accessToken: data.accessToken }, 'Logged in successfully');
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user }, 'Current user loaded');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await verifyEmailToken(req.validated.query.token);
  sendSuccess(res, { user }, 'Email verified successfully');
});

export const refresh = asyncHandler(async (req, res) => {
  const data = await refreshAuthSession(req.cookies?.[env.refreshCookieName], getRequestContext(req));
  setRefreshCookie(req, res, data.refreshToken);
  sendSuccess(res, { user: data.user, accessToken: data.accessToken }, 'Session refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  await revokeAuthSession(req.cookies?.[env.refreshCookieName]);
  clearRefreshCookie(req, res);
  sendSuccess(res, null, 'Logged out successfully');
});

function getRequestContext(req) {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  };
}

function setRefreshCookie(req, res, refreshToken) {
  // Use HTTPS-aware cookie flags to avoid refresh/session breakage behind proxies/vercel.
  const isSecure = Boolean(req.secure) || req.headers['x-forwarded-proto'] === 'https';

  res.cookie(env.refreshCookieName, refreshToken, {
    httpOnly: true,
    sameSite: isSecure ? 'none' : 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

function clearRefreshCookie(req, res) {
  const isSecure = Boolean(req.secure) || req.headers['x-forwarded-proto'] === 'https';

  res.clearCookie(env.refreshCookieName, {
    httpOnly: true,
    sameSite: isSecure ? 'none' : 'lax',
    secure: isSecure,
    path: '/'
  });
}

export const listHelpers = asyncHandler(async (req, res) => {
  const helpers = await User.findAll({
    where: { role: 'helper' },
    attributes: ['id', 'name', 'email', 'phone', 'location', 'isAvailable']
  });
  sendSuccess(res, helpers, 'Helpers loaded');
});
