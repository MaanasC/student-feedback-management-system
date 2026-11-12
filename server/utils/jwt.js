import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const getSecret = () => process.env.JWT_SECRET || 'university_super_secret_jwt_key_2026';
const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token containing authenticated user details
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: getExpiresIn(),
  });
};

/**
 * Verify a JWT token
 */
export const verifyJWT = (token) => {
  return jwt.verify(token, getSecret());
};

export default { generateToken, verifyJWT };
