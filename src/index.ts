#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GetAbiSchema, getAbi } from "./actions/abi.js";
import { getSupportedChains } from "./actions/supported-chains.js";

const server = new McpServer({
  name: "sourcify-context-server",
  version: "0.1.0",
});

server.tool("sourcify-supported-chains", "List supported chains", async () => {
  try {
    const supportedChains = await getSupportedChains();
    return {
      content: [
        {
          type: "text",
          text: supportedChains
            .map(
              ({ name, chainId }) => `- Name: ${name} (Chain ID: ${chainId})`,
            )
            .join("\n"),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          isError: true,
          type: "text",
          text: `Error: ${message}`,
        },
      ],
    };
  }
});

server.tool(
  "sourcify-abi",
  "Get smart contract ABI for Ethereum address on a specified chain",
  GetAbiSchema.shape,
  async (args) => {
    try {
      const abi = await getAbi(args);
      return {
        content: [
          {
            type: "text",
            text: "```json\n" + JSON.stringify(abi, null, 2) + "\n```",
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            isError: true,
            type: "text",
            text: `Error: ${message}`,
          },
        ],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
