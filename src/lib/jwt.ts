const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function signAccessToken(payload: object, expiresIn = "15m") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function signRefreshToken(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}
