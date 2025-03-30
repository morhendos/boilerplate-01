/**
 * Database Module
 * 
 * Serves as the entry point for database operations, exposing a clean API
 * for the rest of the application to use.
 */

// Export simplified connection utilities - our preferred approach
import { withConnection, getConnection as getSimplifiedConnection, safeSerialize } from './simplified-connection';
export { withConnection, getSimplifiedConnection, safeSerialize };

// Export error handling utilities
export * from './error-handler';
export * from './unified-error-handler';

// Re-export useful types
export { Connection } from 'mongoose';

// Define a simple logger class for backward compatibility
export class ConsoleLogger {
  debug(message: string, ...args: any[]): void {
    console.debug(message, ...args);
  }
  
  info(message: string, ...args: any[]): void {
    console.info(message, ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    console.warn(message, ...args);
  }
  
  error(message: string, ...args: any[]): void {
    console.error(message, ...args);
  }
}

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
  if (typeof mongoose !== 'undefined' && mongoose.connection) {
    return mongoose.connection.close();
  }
};

/**
 * Create a logger instance (for backward compatibility)
 * 
 * @param prefix The prefix for log messages
 * @returns A logger instance
 */
export const createLogger = (prefix: string) => {
  class PrefixedLogger extends ConsoleLogger {
    prefix: string;
    
    constructor(prefix: string) {
      super();
      this.prefix = prefix;
    }

    debug(message: string, ...args: any[]): void {
      super.debug(`[${this.prefix}] ${message}`, ...args);
    }
    
    info(message: string, ...args: any[]): void {
      super.info(`[${this.prefix}] ${message}`, ...args);
    }
    
    warn(message: string, ...args: any[]): void {
      super.warn(`[${this.prefix}] ${message}`, ...args);
    }
    
    error(message: string, ...args: any[]): void {
      super.error(`[${this.prefix}] ${message}`, ...args);
    }
  }
  
  return new PrefixedLogger(prefix);
};