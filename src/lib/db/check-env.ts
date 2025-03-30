/**
 * Environment Variable Checker for MongoDB
 * 
 * This utility checks and normalizes environment variables
 * related to MongoDB connections.
 */

import { loadEnvVars } from './env-debug';
import { normalizeMongoURI, getSanitizedURI, extractDatabaseName } from '@/utils/mongodb-uri';
import { logger } from '@/lib/logger';

async function checkEnvironment() {
  logger.info('\n📋 Checking MongoDB Environment Variables...\n');
  
  // Load environment variables first
  loadEnvVars();
  
  // Check MongoDB URI
  const mongoUri = process.env.MONGODB_URI || '';
  if (!mongoUri) {
    logger.error('❌ MONGODB_URI is not set!');
    logger.info('   It should be set in your .env.local file');
    logger.info('   Example: MONGODB_URI=mongodb://localhost:27017/saas_db');
  } else {
    // Mask sensitive parts of the URI for logging
    const maskedUri = getSanitizedURI(mongoUri);
    logger.info(`✅ MONGODB_URI is set: ${maskedUri}`);
    
    // Check if URI has a database
    const dbName = extractDatabaseName(mongoUri);
    if (!dbName) {
      logger.warn(`⚠️ Warning: No database specified in URI`);
      logger.info('   Consider specifying a database name in your connection string');
      
      // Normalize the URI
      const normalizedUri = normalizeMongoURI(mongoUri);
      const normalizedDbName = extractDatabaseName(normalizedUri);
      logger.info(`ℹ️ Normalized database name would be: ${normalizedDbName}`);
    } else {
      logger.info(`✅ Database name is set to "${dbName}"`);
    }
  }
  
  // Check NextAuth environment variables
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  
  logger.info('\n📋 Checking NextAuth Environment Variables...\n');
  
  if (!nextAuthSecret) {
    logger.error('❌ NEXTAUTH_SECRET is not set!');
    logger.info('   It should be set in your .env.local file');
    logger.info('   Generate a secure random string for this value');
  } else {
    logger.info('✅ NEXTAUTH_SECRET is set');
  }
  
  if (!nextAuthUrl) {
    logger.warn('⚠️ NEXTAUTH_URL is not set!');
    logger.info('   This is optional in development but required in production');
    logger.info('   Example: NEXTAUTH_URL=https://your-production-domain.com');
  } else {
    logger.info(`✅ NEXTAUTH_URL is set: ${nextAuthUrl}`);
  }
  
  logger.info('\n📋 Environment Check Complete\n');
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkEnvironment();
}

export default checkEnvironment;
