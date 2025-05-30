import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI, { AzureOpenAI } from 'openai';
import { chromium } from 'playwright';

// Environment variables for configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// Azure OpenAI configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT =
  process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
const AZURE_OPENAI_API_VERSION =
  process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview';

// Embedding model configuration
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';

if (!QDRANT_URL) {
  throw new Error('QDRANT_URL environment variable is required');
}

if (!QDRANT_API_KEY) {
  throw new Error('QDRANT_API_KEY environment variable is required');
}

export class ApiClient {
  qdrantClient: QdrantClient;
  openaiClient?: OpenAI;
  azureOpenaiClient?: AzureOpenAI;
  useAzure: boolean;
  browser: import('playwright').Browser | null;

  constructor() {
    // Initialize Qdrant client with cloud configuration
    this.qdrantClient = new QdrantClient({
      url: QDRANT_URL,
      apiKey: QDRANT_API_KEY,
    });

    // Initialize browser to null
    this.browser = null;

    // Determine whether to use Azure OpenAI or standard OpenAI
    this.useAzure = !!(AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_KEY);

    // Initialize appropriate client based on available credentials
    if (this.useAzure) {
      // Azure OpenAI client initialization
      this.azureOpenaiClient = new AzureOpenAI({
        apiKey: AZURE_OPENAI_KEY,
        endpoint: AZURE_OPENAI_ENDPOINT,
        apiVersion: AZURE_OPENAI_API_VERSION,
        // Don't specify a default deployment here - we'll specify the appropriate model when calling the API
      });
    } else if (OPENAI_API_KEY) {
      // Standard OpenAI client initialization
      this.openaiClient = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
    } else {
      // Log a warning but don't throw an error yet - error will be thrown when embeddings are actually requested
    }
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async getEmbeddings(text: string): Promise<number[]> {
    if (this.useAzure) {
      if (!this.azureOpenaiClient) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Azure OpenAI client not configured properly'
        );
      }

      try {
        const response = await this.azureOpenaiClient.embeddings.create({
          input: text,
          model: EMBEDDING_MODEL, // Use the embedding model, not the chat completion model
        });
        return response.data[0].embedding;
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to generate embeddings with Azure OpenAI: ${error}`
        );
      }
    } else {
      if (!this.openaiClient) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'OpenAI API key not configured'
        );
      }

      try {
        const response = await this.openaiClient.embeddings.create({
          model: EMBEDDING_MODEL,
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to generate embeddings with OpenAI: ${error}`
        );
      }
    }
  }

  async initCollection(COLLECTION_NAME: string) {
    try {
      const collections = await this.qdrantClient.getCollections();
      const exists = collections.collections.some(
        c => c.name === COLLECTION_NAME
      );

      if (!exists) {
        await this.qdrantClient.createCollection(COLLECTION_NAME, {
          vectors: {
            size: 1536, // OpenAI ada-002 embedding size
            distance: 'Cosine',
          },
          // Add optimized settings for cloud deployment
          optimizers_config: {
            default_segment_number: 2,
            memmap_threshold: 20000,
          },
          replication_factor: 2,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('unauthorized')) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Failed to authenticate with Qdrant. Please check your API key.'
          );
        }

        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ETIMEDOUT')
        ) {
          throw new McpError(
            ErrorCode.InternalError,
            'Failed to connect to Qdrant. Please check your QDRANT_URL.'
          );
        }
      }
      // No else needed here as previous conditions will throw
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to initialize Qdrant collection: ${error}`
      );
    }
  }
}
