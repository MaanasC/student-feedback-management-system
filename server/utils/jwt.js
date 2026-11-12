import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Authoritative JWT Secret Retrieval
 * Strictly prevents startup or token operations if JWT_SECRET is unset.
 * Never provides hardcoded fallback secrets.
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    const errorMsg = '[FATAL CONFIG ERROR] JWT_SECRET environment variable is missing or empty.';
    if (process.env.NODE_ENV === 'production') {
      console.error(errorMsg);
      process.exit(1);
    }
    throw new Error(errorMsg);
  }
  return secret.trim();
};

export const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token containing authenticated user details
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getExpiresIn(),
  });
};

/**
 * Verify a JWT token
 */
export const verifyJWT = (token) => {
  return jwt.verify(token, getJwtSecret());
};

export default { getJwtSecret, generateToken, verifyJWT };
