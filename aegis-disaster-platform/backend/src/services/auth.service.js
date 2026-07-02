import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Session, User } from '../models/index.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../helpers/token.js';

const REFRESH_TOKEN_TTL_DAYS = 30;

function generateVerificationToken() {
  return crypto.randomBytes(24).toString('hex');
}

export async function registerUser(payload, context = {}) {
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const verificationToken = generateVerificationToken();

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    role: payload.role,
    passwordHash,
    emailVerified: false,
    verificationToken
  });

  const result = await createAuthSession(user, context);
  return {
    ...result,
    verificationToken
  };
}

export async function loginUser({ email, password, role }, context = {}) {
  const user = await User.findOne({ where: { email } });
  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (role && user.role !== role) {
    const error = new Error(`This account is registered as ${user.role}. Please choose the correct role.`);
    error.statusCode = 403;
    throw error;
  }

  return createAuthSession(user, context);
}

export async function verifyEmailToken(token) {
  if (!token) {
    const error = new Error('Email verification token is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ where: { verificationToken: token } });
  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  await user.update({ emailVerified: true, verificationToken: null });
  return sanitizeUser(user);
}

export async function refreshAuthSession(refreshToken, context = {}) {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  const decoded = verifyRefreshToken(refreshToken);
  const session = await Session.findByPk(decoded.sid, {
    include: [{ model: User, as: 'user' }]
  });

  const tokenHash = hashToken(refreshToken);
  const isRevoked = Boolean(session?.revokedAt);
  const isExpired = session ? session.expiresAt.getTime() <= Date.now() : true;
  const isMismatched = session?.refreshTokenHash !== tokenHash;

  if (!session || isRevoked || isExpired || isMismatched) {
    const error = new Error('Invalid refresh session');
    error.statusCode = 401;
    throw error;
  }

  await session.update({ revokedAt: new Date() });
  return createAuthSession(session.user, context);
}

export async function revokeAuthSession(refreshToken) {
  if (!refreshToken) return;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    await Session.update({ revokedAt: new Date() }, { where: { id: decoded.sid } });
  } catch {
    // Logout should be idempotent even when the client has an expired token.
  }
}

async function createAuthSession(user, context = {}) {
  const session = await Session.create({
    userId: user.id,
    refreshTokenHash: 'pending',
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
    expiresAt: addDays(new Date(), REFRESH_TOKEN_TTL_DAYS)
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, sid: session.id });

  await session.update({ refreshTokenHash: hashToken(refreshToken) });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  };
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sanitizeUser(user) {
  const json = user.toJSON();
  delete json.passwordHash;
  delete json.verificationToken;
  return json;
}
