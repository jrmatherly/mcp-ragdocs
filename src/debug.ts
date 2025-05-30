import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { ApiClient } from './api-client.js';

// Create a debug logger that writes to a file instead of using console directly
class DebugLogger {
  private logFile: string;

  constructor(filename = 'debug.log') {
    this.logFile = path.join(process.cwd(), filename);
    // Clear previous log file
    fs.writeFileSync(
      this.logFile,
      `Debug session started at ${new Date().toISOString()}\n`
    );
  }

  log(message: string, ...args: unknown[]): void {
    const formattedArgs = args
      .map(arg => {
        if (arg instanceof Error) {
          return `${arg.message}\n${arg.stack}`;
        }
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      })
      .join(' ');

    const logMessage = `[INFO] ${message} ${formattedArgs}\n`;
    fs.appendFileSync(this.logFile, logMessage);

    // For immediate feedback during debugging, still output to console
    // This can be removed in production if needed
    process.stdout.write(logMessage);
  }

  error(message: string, ...args: unknown[]): void {
    const formattedArgs = args
      .map(arg => {
        if (arg instanceof Error) {
          return `${arg.message}\n${arg.stack}`;
        }
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      })
      .join(' ');

    const logMessage = `[ERROR] ${message} ${formattedArgs}\n`;
    fs.appendFileSync(this.logFile, logMessage);

    // For immediate feedback during debugging, still output to console
    // This can be removed in production if needed
    process.stderr.write(logMessage);
  }
}

const logger = new DebugLogger();

/**
 * Tests each component of the RAG system to diagnose potential issues.
 * This utility helps identify problems with:
 * - Browser initialization for web scraping
 * - Embedding generation with Azure OpenAI or OpenAI
 * - Qdrant vector database connectivity
 *
 * @returns {Promise<void>}
 */
async function testComponents(): Promise<void> {
  const apiClient = new ApiClient();

  try {
    // Test browser initialization
    logger.log('Testing browser...');
    await apiClient.initBrowser();
    logger.log('Browser initialized successfully');

    // Test Azure OpenAI connectivity
    logger.log('Testing embeddings...');
    const testEmbedding = await apiClient.getEmbeddings('This is a test');
    logger.log(
      'Embedding generated successfully, length:',
      testEmbedding.length
    );

    // Test Qdrant connectivity
    logger.log('Testing Qdrant...');
    await apiClient.initCollection(
      process.env.COLLECTION_NAME || 'documentation'
    );
    logger.log('Qdrant collection initialized successfully');
  } catch (error) {
    // Format error output based on type
    if (error instanceof Error) {
      logger.error('Test failed:', error);
    } else {
      logger.error('Test failed with unknown error:', error);
    }
  } finally {
    // Always clean up resources
    await apiClient.cleanup();
    logger.log('Resources cleaned up');
  }
}

// Execute the tests and properly handle any top-level errors
testComponents().catch(error => {
  logger.error('Unhandled error in test execution:', error);
  process.exit(1);
});

// Output final message
process.on('exit', code => {
  if (code === 0) {
    logger.log('Tests completed successfully');
  }
});
