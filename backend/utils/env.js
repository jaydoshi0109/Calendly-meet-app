// utils/env.js
import dotenv from 'dotenv';

dotenv.config();

export const getEnvVariable = (key, required = true) => {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Environment variable ${key} is required.`);
  }
  return value;
};

// Example usage:
// import { getEnvVariable } from './utils/env.js';
// const MONGO_URI = getEnvVariable('MONGO_URI');