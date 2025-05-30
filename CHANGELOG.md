# Changelog

## [1.4.1] - 2025-05-30

### Bug Fixes and Improvements

- Fixed Azure OpenAI embedding generation
  - Properly configured embedding model selection for Azure OpenAI
  - Updated client initialization to handle model deployments correctly
  - Added better error handling for embedding generation failures

- Enhanced debugging capabilities
  - Added comprehensive debug utility for component testing
  - Implemented file-based logging for better diagnostics
  - Added proper resource cleanup and error handling

## [1.4.0] - 2025-05-30

### Infrastructure and DevOps Improvements

- Added Docker Compose setup for local development
  - Integrated Qdrant vector database with proper configuration
  - Added initialization container to automate collection setup
  - Implemented API key authentication for Qdrant security
  - Created comprehensive configuration with environment variables

- Enhanced project documentation
  - Updated README with Docker setup instructions
  - Added detailed environment variable documentation
  - Improved configuration guidance for both OpenAI and Azure OpenAI

- Improved development setup
  - Added proper .gitignore rules for Docker volumes
  - Updated environment configuration examples
  - Created consistent structure for documentation

## [1.3.0] - 2025-05-30

### Feature Additions

- Added support for Azure OpenAI
  - Implemented flexible provider selection between standard OpenAI and Azure OpenAI
  - Added Azure OpenAI environment variables for configuration
  - Updated embedding generation to work with both providers
  - Added comprehensive documentation for Azure setup

## [1.2.0] - 2025-05-30

### Code Quality Improvements

- Enhanced type safety throughout the codebase
  - Replaced all `any` types with appropriate specific types
  - Added proper type annotations for API responses and parameters
  - Improved error handling with more specific types
  - Enhanced null checking for browser instances

- Refactored control flow for better readability
  - Removed unnecessary else clauses across all files
  - Improved error handling patterns for better maintainability

- Cleaned up codebase
  - Removed redundant constructors
  - Eliminated unused imports
  - Updated Node.js imports to use the node: protocol

### Configuration Enhancement

- Added configurable collection name through environment variable
  - Added `COLLECTION_NAME` environment variable (default: 'documentation')
  - Updated all collection references to use the configurable name
  - Updated configuration documentation

## [1.1.0] - 2024-03-14

### Initial Feature Addition

- Implemented new clear_queue tool for queue management
  - Created src/tools/clear-queue.ts with core functionality
  - Added handler in src/handlers/clear-queue.ts
  - Integrated with existing queue management system
  - Added tool exports and registration

### Code Organization

- Improved tool ordering in handler-registry.ts
  - Moved remove_documentation before extract_urls
  - Enhanced logical grouping of related tools
  - Updated imports to match new ordering

### Documentation Enhancement Phase 1

- Enhanced tool descriptions in handler-registry.ts:
  1. search_documentation
     - Added natural language query support details
     - Clarified result ranking and context
     - Improved limit parameter documentation
  2. list_sources
     - Added details about indexed documentation
     - Clarified source information returned
  3. extract_urls
     - Enhanced URL crawling explanation
     - Added queue integration details
     - Clarified URL validation requirements
  4. remove_documentation
     - Added permanence warning
     - Clarified URL matching requirements
  5. list_queue
     - Added queue monitoring details
     - Clarified status checking capabilities
  6. run_queue
     - Added processing behavior details
     - Documented error handling
  7. clear_queue
     - Detailed queue clearing behavior
     - Added permanence warnings
     - Documented URL re-adding requirements

### Documentation Enhancement Phase 2

- Updated README.md
  - Removed add_documentation and queue_documentation tools
  - Updated tool descriptions to match handler-registry.ts
  - Added parameter format requirements
  - Enhanced usage guidance
