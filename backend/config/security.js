const parseList = (value = '') => {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const nodeEnv = (process.env.NODE_ENV || 'development').trim();
const isProduction = nodeEnv === 'production';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error('JWT_SECRET environment variable is required in production environments');
  }

  console.warn('⚠️  JWT_SECRET is not set. Falling back to a weak development secret.');
  jwtSecret = 'development-secret-change-me';
}

if (isProduction && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long in production');
}

const allowedOrigins = parseList(process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '');
const allowAllInDev = !allowedOrigins.length && !isProduction;

module.exports = {
  allowedOrigins,
  allowAllInDev,
  isProduction,
  jwtSecret,
  nodeEnv
};
