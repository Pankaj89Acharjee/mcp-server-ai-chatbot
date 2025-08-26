# MCP Client

A TypeScript client for communicating with Model Context Protocol (MCP) servers. This client provides a simple and robust interface for connecting to MCP servers, calling tools, and accessing resources.

## Features

- 🔌 **Easy Connection**: Simple configuration to connect to any MCP server
- 🛠️ **Tool Management**: List and call tools provided by the server
- 📁 **Resource Access**: List and read resources from the server
- ⏱️ **Timeout Support**: Built-in timeout handling for tool calls
- 🐛 **Debug Mode**: Optional debug logging for troubleshooting
- 🔒 **Error Handling**: Comprehensive error handling and connection management

## Installation

The MCP client is already included in this project. Make sure you have the required dependency:

```bash
npm install @modelcontextprotocol/sdk
```

## Basic Usage

### 1. Create a Client

```typescript
import { MCPClient } from './mcp/mcpClient.js';

const client = new MCPClient({
  config: {
    command: 'node',
    args: ['./path/to/your/mcp-server.js'],
    env: {
      NODE_ENV: 'production',
    },
    cwd: process.cwd(),
  },
  debug: true,
  autoConnect: true,
});
```

### 2. Connect to Server

```typescript
// If autoConnect is false, connect manually
await client.connect();
```

### 3. List Available Tools

```typescript
const tools = await client.listTools();
console.log('Available tools:', tools.map(t => t.name));
```

### 4. Call a Tool

```typescript
const result = await client.callTool('tool_name', {
  parameter1: 'value1',
  parameter2: 'value2',
});
console.log('Tool result:', result);
```

### 5. Access Resources

```typescript
// List resources
const resources = await client.listResources('file:///');
console.log('Resources:', resources);

// Read a resource
const content = await client.readResource('file:///path/to/file.txt');
console.log('Content:', content);
```

### 6. Disconnect

```typescript
await client.disconnect();
```

## Configuration Options

### MCPClientConfig

| Property | Type | Description |
|----------|------|-------------|
| `command` | `string` | The command to execute the MCP server (e.g., 'node', 'python') |
| `args` | `string[]` | Command line arguments for the server |
| `env` | `Record<string, string>` | Environment variables for the server process |
| `cwd` | `string` | Working directory for the server process |
| `timeout` | `number` | Timeout for operations (optional) |

### MCPClientOptions

| Property | Type | Description |
|----------|------|-------------|
| `config` | `MCPClientConfig` | Server configuration |
| `debug` | `boolean` | Enable debug logging (default: false) |
| `autoConnect` | `boolean` | Automatically connect on instantiation (default: true) |

## API Reference

### Methods

#### `connect(): Promise<void>`
Connect to the MCP server.

#### `disconnect(): Promise<void>`
Disconnect from the MCP server.

#### `listTools(): Promise<Tool[]>`
Get a list of available tools from the server.

#### `callTool(name: string, arguments_: Record<string, any>): Promise<any>`
Call a specific tool with the given arguments.

#### `callToolWithTimeout(name: string, arguments_: Record<string, any>, timeoutMs: number): Promise<any>`
Call a tool with a timeout. Default timeout is 30 seconds.

#### `listResources(uri: string): Promise<Resource[]>`
List resources available at the given URI.

#### `readResource(uri: string): Promise<any>`
Read the content of a resource at the given URI.

#### `getServerInfo(): Promise<any>`
Get server capabilities and information.

#### `getToolsInfo(): Promise<Array<{ name: string; description: string; inputSchema?: any }>>`
Get information about all available tools.

#### `hasTool(name: string): Promise<boolean>`
Check if a specific tool exists.

### Properties

#### `connected: boolean`
Check if the client is currently connected to the server.

## Examples

### Example 1: File Server

```typescript
const client = new MCPClient({
  config: {
    command: 'node',
    args: ['./file-server.js'],
    env: {},
    cwd: process.cwd(),
  },
  debug: true,
});

try {
  await client.connect();
  
  // List files in a directory
  if (await client.hasTool('list_files')) {
    const result = await client.callTool('list_files', {
      path: './src'
    });
    console.log('Files:', result);
  }
  
} finally {
  await client.disconnect();
}
```

### Example 2: Database Server

```typescript
const client = new MCPClient({
  config: {
    command: 'node',
    args: ['./database-server.js'],
    env: {
      DATABASE_URL: 'postgresql://user:pass@localhost/db',
    },
  },
});

try {
  await client.connect();
  
  // Execute a query
  const result = await client.callTool('execute_query', {
    query: 'SELECT * FROM users LIMIT 10',
    database: 'main'
  });
  
  console.log('Query result:', result);
  
} finally {
  await client.disconnect();
}
```

### Example 3: AI Model Server

```typescript
const client = new MCPClient({
  config: {
    command: 'python',
    args: ['./ai-server.py'],
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
  },
});

try {
  await client.connect();
  
  // Generate text
  const result = await client.callTool('generate_text', {
    prompt: 'Write a short story about a robot.',
    max_tokens: 100,
    temperature: 0.7
  });
  
  console.log('Generated text:', result);
  
} finally {
  await client.disconnect();
}
```

## Error Handling

The client includes comprehensive error handling:

```typescript
try {
  const result = await client.callTool('some_tool', {});
} catch (error) {
  if (error.message.includes('not connected')) {
    console.log('Client is not connected');
  } else if (error.message.includes('timeout')) {
    console.log('Operation timed out');
  } else {
    console.log('Tool call failed:', error.message);
  }
}
```

## Debug Mode

Enable debug mode to see detailed logging:

```typescript
const client = new MCPClient({
  config: { /* ... */ },
  debug: true, // This will log connection status, tool calls, etc.
});
```

## Best Practices

1. **Always disconnect**: Use try/finally blocks to ensure the client disconnects properly
2. **Handle errors**: Wrap tool calls in try/catch blocks
3. **Use timeouts**: For long-running operations, use `callToolWithTimeout`
4. **Check tool existence**: Use `hasTool()` before calling tools
5. **Enable debug mode**: During development, enable debug mode for better visibility

## Troubleshooting

### Common Issues

1. **Connection failed**: Check that the server command and arguments are correct
2. **Tool not found**: Use `listTools()` to see available tools
3. **Permission denied**: Check file permissions for the server executable
4. **Timeout errors**: Increase timeout values or check server performance

### Debug Tips

- Enable debug mode to see detailed connection and operation logs
- Check the server's stderr output for error messages
- Verify the server implements the MCP protocol correctly
- Test the server independently before using the client

## License

This MCP client is part of the agentic-server project and follows the same license terms.
