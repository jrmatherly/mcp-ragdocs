import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ApiClient } from '../api-client.js';
import { McpToolResponse } from '../types.js';

export abstract class BaseHandler {
  protected server: Server;
  protected apiClient: ApiClient;

  constructor(server: Server, apiClient: ApiClient) {
    this.server = server;
    this.apiClient = apiClient;
  }

  // Using Record<string, unknown> instead of 'any' for better type safety
  // while still allowing subclasses to narrow the type as needed
  protected abstract handle(
    args: Record<string, unknown>
  ): Promise<McpToolResponse>;
}
