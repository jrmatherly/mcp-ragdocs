export interface DocumentChunk {
  text: string;
  url: string;
  title: string;
  timestamp: string;
}

export interface DocumentPayload extends DocumentChunk {
  _type: 'DocumentChunk';
  [key: string]: unknown;
}

export function isDocumentPayload(
  payload: unknown
): payload is DocumentPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Partial<DocumentPayload>;
  return (
    p._type === 'DocumentChunk' &&
    typeof p.text === 'string' &&
    typeof p.url === 'string' &&
    typeof p.title === 'string' &&
    typeof p.timestamp === 'string'
  );
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    // Using a more specific type for schema properties
    properties: Record<
      string,
      {
        type?: string;
        description?: string;
        default?: unknown;
        enum?: string[];
        // Array-related properties
        items?: {
          type?: string;
          description?: string;
          enum?: string[];
        };
        minItems?: number;
        maxItems?: number;
        // Other JSON Schema property attributes
        required?: string[];
        format?: string;
        minimum?: number;
        maximum?: number;
      }
    >;
    required: string[];
  };
}

export interface Source {
  title: string;
  url: string;
}

export interface GroupedSources {
  [domain: string]: {
    [subdomain: string]: Source[];
  };
}

export interface McpToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}
