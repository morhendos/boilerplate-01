/**
 * MongoDB Utilities
 * 
 * This module provides comprehensive utility functions for MongoDB handling,
 * including URI management, validation, ObjectId utilities, and error formatting.
 */

import { ObjectId } from 'mongodb';
import { createLogger } from '@/lib/logger';

// Logger instance
const logger = createLogger('MongoDB');

/*************************
 * URI Management
 *************************/

/**
 * Normalizes a MongoDB URI to ensure it has a valid database name
 * 
 * @param uri - The MongoDB connection URI to normalize
 * @param dbName - The database name to use if not specified in the URI
 * @returns A properly formatted MongoDB connection URI
 */
export function normalizeMongoURI(uri: string, dbName: string = 'saas_db'): string {
  try {
    // Parse the URI to properly handle different URI formats
    const url = new URL(uri);
    
    // Extract the current path (which might contain a database name)
    let path = url.pathname;
    
    // Check if the path is just a slash or empty, or contains an invalid database name
    if (path === '/' || path === '' || path.includes('_/')) {
      // Replace the path with just the database name
      url.pathname = `/${dbName}`;
    } else {
      // If the path already has a database name (but not the one we want)
      // We extract everything before any query parameters and replace the db name
      
      // Remove any query parameters from consideration
      const pathWithoutQuery = path.split('?')[0];
      
      // Check if the path already has our desired database name
      if (pathWithoutQuery === `/${dbName}`) {
        // Nothing to do, correct database name is already in the path
      } else {
        // Replace whatever database name is there with our desired one
        url.pathname = `/${dbName}`;
      }
    }
    
    // Ensure we have the necessary query parameters
    const searchParams = new URLSearchParams(url.search);
    if (!searchParams.has('retryWrites')) {
      searchParams.set('retryWrites', 'true');
    }
    if (!searchParams.has('w')) {
      searchParams.set('w', 'majority');
    }
    
    // Update the search parameters
    url.search = searchParams.toString();
    
    // Return the properly formatted URI
    return url.toString();
  } catch (error) {
    // If URL parsing fails, fall back to a more basic string manipulation
    logger.warn('Failed to parse MongoDB URI as URL, falling back to string manipulation');
    
    // Remove any existing database name and query parameters
    let baseUri = uri;
    
    // Check for presence of query parameters
    const queryIndex = baseUri.indexOf('?');
    if (queryIndex > -1) {
      baseUri = baseUri.substring(0, queryIndex);
    }
    
    // Ensure URI ends with a single slash
    if (!baseUri.endsWith('/')) {
      baseUri = `${baseUri}/`;
    }
    
    // Append database name and query parameters
    return `${baseUri}${dbName}?retryWrites=true&w=majority`;
  }
}

/**
 * Sanitizes a MongoDB URI for logging purposes by hiding credentials
 * 
 * @param uri - The MongoDB connection URI to sanitize
 * @returns A sanitized URI with credentials removed
 */
export function getSanitizedURI(uri: string): string {
  try {
    const url = new URL(uri);
    if (url.username && url.password) {
      return uri.replace(`${url.username}:${url.password}`, '***:***');
    }
    return uri;
  } catch {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  }
}

/**
 * Validates a MongoDB URI
 * 
 * @param uri - The MongoDB connection URI to validate
 * @returns True if the URI is valid, false otherwise
 */
export function validateMongoURI(uri: string): boolean {
  if (!uri) return false;
  
  try {
    // Basic URI validation
    const mongoRegex = /^mongodb(\+srv)?:\/\/.+/;
    if (!mongoRegex.test(uri)) return false;

    // Parse URI to validate structure
    const url = new URL(uri);
    
    // For local development, we don't require username/password
    if (process.env.NODE_ENV === 'development') {
      return !!url.hostname;  // Only require hostname for local development
    }
    
    // For production, require full authentication
    if (!url.hostname) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extracts the database name from a MongoDB URI
 * 
 * @param uri - The MongoDB connection URI
 * @returns The database name or null if not found
 */
export function extractDatabaseName(uri: string): string | null {
  try {
    const url = new URL(uri);
    
    // Extract pathname and remove leading slash
    const pathname = url.pathname;
    if (!pathname || pathname === '/') {
      return null;
    }
    
    // Remove leading slash and return
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch (error) {
    // If URI parsing fails, try string manipulation
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    return match ? match[1] : null;
  }
}

/**
 * Checks if a URI is for a local MongoDB connection
 * 
 * @param uri MongoDB connection URI
 * @returns True if the URI is for a local connection
 */
export function isLocalConnection(uri: string): boolean {
  try {
    const url = new URL(uri);
    return url.hostname === 'localhost' || 
           url.hostname === '127.0.0.1' || 
           url.hostname === '0.0.0.0' ||
           url.hostname.startsWith('192.168.') ||
           url.hostname.startsWith('10.') ||
           url.hostname === 'host.docker.internal';
  } catch (error) {
    // If URL parsing fails, do a simple string check
    return uri.includes('localhost') || 
           uri.includes('127.0.0.1') || 
           uri.includes('0.0.0.0');
  }
}

/*************************
 * ObjectId Utilities
 *************************/

/**
 * Checks if a string is a valid MongoDB ObjectId
 * 
 * @param id - String to check
 * @returns True if the string is a valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  try {
    return ObjectId.isValid(id);
  } catch {
    return false;
  }
}

/**
 * Safely converts a string to a MongoDB ObjectId
 * 
 * @param id - String to convert
 * @returns MongoDB ObjectId or null if invalid
 */
export function toObjectId(id: string): ObjectId | null {
  try {
    if (ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    return null;
  } catch {
    return null;
  }
}

/*************************
 * Error Handling
 *************************/

/**
 * Formats a MongoDB error message for user display
 * 
 * @param error - The error object
 * @param fallbackMessage - Fallback message if error can't be parsed
 * @returns User-friendly error message
 */
export function formatMongoError(error: any, fallbackMessage: string = 'Database error'): string {
  if (!error) {
    return fallbackMessage;
  }
  
  // Handle mongoose/MongoDB specific errors
  if (error.name === 'MongoServerError') {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const keyValue = error.keyValue ? Object.keys(error.keyValue).join(', ') : 'field';
      return `A record with this ${keyValue} already exists`;
    }
    return `Database error: ${error.message}`;
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError' && error.errors) {
    const messages = Object.values(error.errors)
      .map((err: any) => err.message || 'Validation failed')
      .join('; ');
    return `Validation error: ${messages}`;
  }
  
  // Handle connection errors
  if (error.name === 'MongoNetworkError') {
    return 'Unable to connect to database. Please try again later.';
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return error.message;
  }
  
  // Default fallback
  return fallbackMessage;
}
