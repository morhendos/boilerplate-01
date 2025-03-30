/**
 * Database Module
 * 
 * Serves as the entry point for database operations, exposing a clean API
 * for the rest of the application to use.
 * 
 * Connection Strategy:
 * This module uses the simplified-connection.ts module as the primary means
 * of connecting to MongoDB. This approach ensures a single, reliable connection
 * is maintained throughout the application's lifetime.
 */

// Import mongoose for direct access
import mongoose from 'mongoose';

// Export simplified connection utilities - our preferred approach
import { withConnection, getConnection as getSimplifiedConnection, safeSerialize } from './simplified-connection';
export { withConnection, getSimplifiedConnection, safeSerialize };

// Export error handling utilities
export * from './error-handler';
export * from './unified-error-handler';

// Re-export useful types
export { Connection } from 'mongoose';

// Use the shared logger
import { createLogger } from '@/lib/logger';

// Database logger instance
const dbLogger = createLogger('DB');

/**
 * Get a MongoDB connection (simplified method)
 * 
 * @param options Connection options (ignored, kept for backward compatibility)
 * @returns A Promise resolving to a Connection
 */
export const getConnection = async (options: any = {}) => {
  return getSimplifiedConnection();
};

/**
 * Disconnect all MongoDB connections
 * 
 * @returns A Promise that resolves when disconnection is complete
 */
export const disconnectAll = async () => {
  try {
    if (mongoose && mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      dbLogger.info('All connections closed');
    }
  } catch (error) {
    dbLogger.error('Error disconnecting all connections:', error);
  }
};

/**
 * Create a database model with proper error handling
 * 
 * @param name Model name
 * @param schema Mongoose schema
 * @returns A Mongoose model
 */
export function createModel<T>(name: string, schema: mongoose.Schema) {
  try {
    // Try to get the model if it's already registered
    return mongoose.models[name] as mongoose.Model<T> || 
      mongoose.model<T>(name, schema);
  } catch (error) {
    // If the model is already registered, return it
    if (error.name === 'OverwriteModelError') {
      return mongoose.model<T>(name);
    }
    throw error;
  }
}

// Export for backward compatibility
export { createLogger };
