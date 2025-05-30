import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import * as cheerio from 'cheerio';
import { ApiClient } from '../api-client.js';
import { McpToolResponse, ToolDefinition } from '../types.js';
import { BaseTool } from './base-tool.js';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUEUE_FILE = path.join(__dirname, '..', '..', 'queue.txt');

export class ExtractUrlsTool extends BaseTool {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    super();
    this.apiClient = apiClient;
  }

  get definition(): ToolDefinition {
    return {
      name: 'extract_urls',
      description: 'Extract all URLs from a given web page',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL of the page to extract URLs from',
          },
          add_to_queue: {
            type: 'boolean',
            description:
              'If true, automatically add extracted URLs to the queue',
            default: false,
          },
        },
        required: ['url'],
      },
    };
  }

  async execute(args: {
    url: string;
    add_to_queue?: boolean;
  }): Promise<McpToolResponse> {
    if (!args.url || typeof args.url !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'URL is required');
    }

    await this.apiClient.initBrowser();

    if (!this.apiClient.browser) {
      throw new McpError(
        ErrorCode.InternalError,
        'Failed to initialize browser for extracting URLs'
      );
    }

    const page = await this.apiClient.browser.newPage();

    try {
      await page.goto(args.url, { waitUntil: 'networkidle' });
      const content = await page.content();
      const $ = cheerio.load(content);
      const urls = new Set<string>();

      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          try {
            const url = new URL(href, args.url);
            // Only include URLs from the same domain to avoid external links
            if (
              url.origin === new URL(args.url).origin &&
              !url.hash &&
              !url.href.endsWith('#')
            ) {
              urls.add(url.href);
            }
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      });

      const urlArray = Array.from(urls);

      if (args.add_to_queue) {
        try {
          // Ensure queue file exists
          try {
            await fs.access(QUEUE_FILE);
          } catch {
            await fs.writeFile(QUEUE_FILE, '');
          }

          // Append URLs to queue
          const urlsToAdd =
            urlArray.join('\n') + (urlArray.length > 0 ? '\n' : '');
          await fs.appendFile(QUEUE_FILE, urlsToAdd);

          return {
            content: [
              {
                type: 'text',
                text: `Successfully added ${urlArray.length} URLs to the queue`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Failed to add URLs to queue: ${error}`,
              },
            ],
            isError: true,
          };
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: urlArray.join('\n') || 'No URLs found on this page.',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to extract URLs: ${error}`,
          },
        ],
        isError: true,
      };
    } finally {
      await page.close();
    }
  }
}
