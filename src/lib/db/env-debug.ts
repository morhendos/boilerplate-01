/**
 * Environment Variables Debug Compatibility Module
 * 
 * This module provides backward compatibility for existing code
 * that imports from the old env-debug.ts file.
 */

import { loadEnvVars as loadVars, ensureEnvVars as checkVars } from '@/config/environment';
import { createLogger } from '@/lib/logger';

// Initialize logger
const logger = createLogger('Env Debug');

/**
 * Load environment variables
 * 
 * @returns Object with all environment variables
 */
export function loadEnvVars(): Record<string, any> {
  logger.debug('Loading environment variables (compatibility layer)');
  return loadVars();
}

/**
 * Ensure required environment variables are set
 * 
 * @throws Error if required environment variables are missing
 */
export function ensureEnvVars(): void {
  logger.debug('Ensuring environment variables (compatibility layer)');
  return checkVars();
}

/**
 * Required environment variables for the application
 */
export const REQUIRED_ENV_VARS = {
  REQUIRED_IN_PRODUCTION: [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ],
  REQUIRED_IN_DEVELOPMENT: [
    'MONGODB_URI',
    'NEXTAUTH_SECRET'
  ]
};

/**
 * Get the value of an environment variable
 * 
 * @param name - Name of the environment variable
 * @param defaultValue - Default value if the variable is not set
 * @returns Value of the environment variable or default value
 */
export function getEnvVar(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue;
}

/**
 * Check if an environment variable is set to 'true'
 * 
 * @param name - Name of the environment variable
 * @returns True if the environment variable is set to 'true'
 */
export function isEnvEnabled(name: string): boolean {
  return process.env[name] === 'true';
}

// Default export for convenience
export default { loadEnvVars, ensureEnvVars, getEnvVar, isEnvEnabled, REQUIRED_ENV_VARS };
