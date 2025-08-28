#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create a simple MCP server
const server = new Server({
  name: 'test-mcp-server',
  version: '1.0.0',
});

// Add some test tools
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
      },
      {
        name: 'add_numbers',
        description: 'Add two numbers together',
        inputSchema: {
          type: 'object',
          properties: {
            a: {
              type: 'number',
              description: 'First number'
            },
            b: {
              type: 'number',
              description: 'Second number'
            }
          },
          required: ['a', 'b']
        }
      },
      {
        name: 'get_current_time',
        description: 'Get the current server time',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'echo':
      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${args.message}`
          }
        ]
      };

    case 'add_numbers':
      const result = args.a + args.b;
      return {
        content: [
          {
            type: 'text',
            text: `${args.a} + ${args.b} = ${result}`
          }
        ]
      };

    case 'get_current_time':
      const now = new Date().toISOString();
      return {
        content: [
          {
            type: 'text',
            text: `Current time: ${now}`
          }
        ]
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Add resource support
server.setRequestHandler('resources/list', async (request) => {
  const { uri } = request.params;
  
  if (uri === 'file:///') {
    return {
      resources: [
        {
          uri: 'file:///test.txt',
          name: 'test.txt',
          description: 'A test file',
          mimeType: 'text/plain'
        },
        {
          uri: 'file:///example.json',
          name: 'example.json',
          description: 'An example JSON file',
          mimeType: 'application/json'
        }
      ]
    };
  }
  
  return { resources: [] };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;
  
  switch (uri) {
    case 'file:///test.txt':
      return {
        contents: [
          {
            type: 'text',
            text: 'This is a test file content.\nHello from the MCP server!'
          }
        ]
      };
      
    case 'file:///example.json':
      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({ message: 'Hello from JSON file', timestamp: new Date().toISOString() }, null, 2)
          }
        ]
      };
      
    default:
      throw new Error(`Resource not found: ${uri}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Test MCP server started and ready to accept connections...');
