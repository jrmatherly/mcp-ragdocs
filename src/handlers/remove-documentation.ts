import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { McpToolResponse } from '../types.js';
import { BaseHandler } from './base-handler.js';

const COLLECTION_NAME = process.env.COLLECTION_NAME || 'documentation';

export class RemoveDocumentationHandler extends BaseHandler {
  async handle(args: { urls: string[] }): Promise<McpToolResponse> {
    if (!args.urls || !Array.isArray(args.urls) || args.urls.length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'urls must be a non-empty array'
      );
    }

    if (!args.urls.every((url: string) => typeof url === 'string')) {
      throw new McpError(ErrorCode.InvalidParams, 'All URLs must be strings');
    }

    try {
      // Delete using filter to match any of the provided URLs
      const result = await this.apiClient.qdrantClient.delete(COLLECTION_NAME, {
        filter: {
          should: args.urls.map((url: string) => ({
            key: 'url',
            match: { value: url },
          })),
        },
        wait: true, // Ensure deletion is complete before responding
      });

      if (!['acknowledged', 'completed'].includes(result.status)) {
        throw new Error('Delete operation failed');
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully removed documentation from ${args.urls.length} source${args.urls.length > 1 ? 's' : ''}: ${args.urls.join(', ')}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('unauthorized')) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            'Failed to authenticate with Qdrant while removing documentation'
          );
        }

        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ETIMEDOUT')
        ) {
          throw new McpError(
            ErrorCode.InternalError,
            'Connection to Qdrant failed while removing documentation'
          );
        }
      }
      // No else needed here as previous conditions will throw
      return {
        content: [
          {
            type: 'text',
            text: `Failed to remove documentation: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }
}
