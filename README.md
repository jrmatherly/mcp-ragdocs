# RAG Documentation MCP Server

An MCP server implementation that provides tools for retrieving and processing documentation through vector search, enabling AI assistants to augment their responses with relevant documentation context.

## Features

- Vector-based documentation search and retrieval
- Support for multiple documentation sources
- Semantic search capabilities
- Automated documentation processing
- Real-time context augmentation for LLMs

## Tools

### search_documentation

Search through stored documentation using natural language queries. Returns matching excerpts with context, ranked by relevance.

**Inputs:**

- `query` (string): The text to search for in the documentation. Can be a natural language query, specific terms, or code snippets.
- `limit` (number, optional): Maximum number of results to return (1-20, default: 5). Higher limits provide more comprehensive results but may take longer to process.

### list_sources

List all documentation sources currently stored in the system. Returns a comprehensive list of all indexed documentation including source URLs, titles, and last update times. Use this to understand what documentation is available for searching or to verify if specific sources have been indexed.

### extract_urls

Extract and analyze all URLs from a given web page. This tool crawls the specified webpage, identifies all hyperlinks, and optionally adds them to the processing queue.

**Inputs:**

- `url` (string): The complete URL of the webpage to analyze (must include protocol, e.g., https://). The page must be publicly accessible.
- `add_to_queue` (boolean, optional): If true, automatically add extracted URLs to the processing queue for later indexing. Use with caution on large sites to avoid excessive queuing.

### remove_documentation

Remove specific documentation sources from the system by their URLs. The removal is permanent and will affect future search results.

**Inputs:**

- `urls` (string[]): Array of URLs to remove from the database. Each URL must exactly match the URL used when the documentation was added.

### list_queue

List all URLs currently waiting in the documentation processing queue. Shows pending documentation sources that will be processed when run_queue is called. Use this to monitor queue status, verify URLs were added correctly, or check processing backlog.

### run_queue

Process and index all URLs currently in the documentation queue. Each URL is processed sequentially, with proper error handling and retry logic. Progress updates are provided as processing occurs. Long-running operations will process until the queue is empty or an unrecoverable error occurs.

### clear_queue

Remove all pending URLs from the documentation processing queue. Use this to reset the queue when you want to start fresh, remove unwanted URLs, or cancel pending processing. This operation is immediate and permanent - URLs will need to be re-added if you want to process them later.

## Usage

The RAG Documentation tool is designed for:

- Enhancing AI responses with relevant documentation
- Building documentation-aware AI assistants
- Creating context-aware tooling for developers
- Implementing semantic documentation search
- Augmenting existing knowledge bases

## Configuration

### Local Development with Docker

This project includes a Docker Compose configuration for local development that automatically sets up a Qdrant vector database instance with proper security:

```bash
# Start the local environment
docker-compose up -d

# Check logs
docker-compose logs -f qdrant

# Stop the environment
docker-compose down
```

The Docker Compose setup includes:

1. **Qdrant Vector Database** - Configured with API key authentication
2. **Initialization Container** - Automatically creates required collections

Make sure to configure your environment variables in the `.env` file before running. See the `.env.example` file for reference.

### Azure OpenAI Configuration

When using Azure OpenAI, you need to properly configure both chat completion and embedding models:

1. **Create Model Deployments in Azure OpenAI Studio**:
   - Deploy a chat model (e.g., `gpt-4o-mini`) for regular completions
   - Deploy an embedding model (e.g., `text-embedding-ada-002`) for vector embeddings
   - Note the deployment names for each model

2. **Configure Environment Variables**:

   ```bash
   # Azure OpenAI configuration
   AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
   AZURE_OPENAI_KEY="your-azure-api-key"
   AZURE_OPENAI_DEPLOYMENT="gpt-4o-mini"  # Your chat model deployment name
   AZURE_OPENAI_API_VERSION="2025-01-01-preview"
   EMBEDDING_MODEL="text-embedding-ada-002"  # Your embedding model name
   ```

This setup ensures proper separation between chat and embedding model deployments, preventing errors during API calls.

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "rag-docs": {
      "command": "npx",
      "args": [
        "-y",
        "@jrmatherly/mcp-ragdocs"
      ],
      "env": {
        // OpenAI configuration (Standard OpenAI)
        "OPENAI_API_KEY": "",
        
        // Azure OpenAI configuration (Alternative to standard OpenAI)
        "AZURE_OPENAI_ENDPOINT": "",
        "AZURE_OPENAI_KEY": "", 
        "AZURE_OPENAI_DEPLOYMENT": "gpt-4o-mini", // Deployment name for your chat model
        "AZURE_OPENAI_API_VERSION": "2023-05-15",
        
        // Qdrant vector database configuration
        "QDRANT_URL": "",
        "QDRANT_API_KEY": "",
        
        // Optional settings
        "COLLECTION_NAME": "documentation",
        "EMBEDDING_MODEL": "text-embedding-ada-002"
      }
    }
  }
}
```

You'll need to provide values for the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key for embeddings generation
- `QDRANT_URL`: URL of your Qdrant vector database instance
- `QDRANT_API_KEY`: API key for authenticating with Qdrant
- `COLLECTION_NAME`: (Optional) Name of the vector database collection (default: 'documentation')

## Environment Variables

### Core Configuration

- `QDRANT_URL`: URL of your Qdrant vector database instance (local or cloud)
- `QDRANT_API_KEY`: API key for authenticating with Qdrant

### Provider Configuration (Choose One)

#### **OpenAI (Standard)**

- `OPENAI_API_KEY`: API key for OpenAI services

#### **Azure OpenAI**

- `AZURE_OPENAI_ENDPOINT`: Endpoint URL for Azure OpenAI services
- `AZURE_OPENAI_KEY`: API key for Azure OpenAI
- `AZURE_OPENAI_DEPLOYMENT`: Name of your embedding model deployment (default: "gpt-4o-mini")
- `AZURE_OPENAI_API_VERSION`: API version to use (default: "2025-01-01-preview")

### Optional Settings

- `COLLECTION_NAME`: Name for vector database collection (default: "documentation")
- `EMBEDDING_MODEL`: Model to use for embeddings (default: "text-embedding-ada-002")

## Development

### NPM Package

This project is published as an npm package.

To publish the package to npm, run the following command:

Create an npm account if you haven't already:

```bash
npm add user
```

Login to npm:

```bash
npm login
```

Ensure package.json is properly configured:

```json
{
  "name": "@jrmatherly/mcp-ragdocs",
  "version": "1.4.0",
  "private": false,
  "files": ["build", "README.md", "LICENSE"],
  "description": "An MCP server for semantic documentation search and retrieval using vector databases to augment LLM capabilities.",
}
```

Publish the package:

```bash
npm publish --access public
```

For future releases, increment the version number in package.json and run:

```bash
npm publish
```

### Code Quality

This project follows modern TypeScript best practices:

- Strong typing throughout the codebase (no `any` types)
- Null safety with proper checks for browser instances
- Clean control flow without unnecessary else clauses
- Node.js standard imports using the node: protocol
- Clear error handling patterns

### Contributing

Contributions are welcome! Please ensure your code adheres to the project's quality standards:

1. Run type checking with `npm run typecheck`
2. Format code with `npm run biome:format:fix`
3. Check for linting errors with `npm run biome:check`
4. Fix linting errors with `npm run biome:check:fix`

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.

## Acknowledgments

This project is a fork of [qpd-v/mcp-ragdocs](https://github.com/qpd-v/mcp-ragdocs), originally developed by qpd-v. The original project provided the foundation for this implementation.
