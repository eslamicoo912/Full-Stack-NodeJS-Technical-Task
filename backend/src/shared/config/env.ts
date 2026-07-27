import dotenv from "dotenv";

dotenv.config();

const requireString = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const requireNumber = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed))
    throw new Error(`Environment variable ${key} must be a valid number`);
  return parsed;
};

export const env = {
  NODE_ENV: requireString("NODE_ENV"),
  PORT: requireNumber("PORT", 3000),
  JWT_SECRET: requireString("JWT_SECRET"),
  JWT_EXPIRES_IN: requireString("JWT_EXPIRES_IN"),
  MONGODB_URI: requireString("MONGODB_URI"),
  SALT_ROUNDS: requireNumber("SALT_ROUNDS", 10),
};
