#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create a simple MCP server
const server = new Server({
  name: 'simple-test-server',
  version: '1.0.0',
});

// Add a simple echo tool
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'echo',
        description: 'Echo back the input message',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to echo back'
            }
          },
          required: ['message']
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'echo') {
    return {
      content: [
        {
          type: 'text',
          text: `Echo: ${args.message}`
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Simple test MCP server started and ready to accept connections...');
