import { McpAgent } from 'agents/mcp'
import { env } from 'cloudflare:workers'

import { CloudflareMCPServer } from '@repo/mcp-common/src/server'

import { registerDocsTools } from './tools/docs'

// The docs MCP server isn't stateful, so we don't have state/props
export type Props = never

export type State = never

export class CloudflareDocumentationMCP extends McpAgent<Env, State, Props> {
	server = new CloudflareMCPServer(undefined, env.MCP_METRICS, {
		name: env.MCP_SERVER_NAME,
		version: env.MCP_SERVER_VERSION,
	})

	constructor(
		public ctx: DurableObjectState,
		public env: Env
	) {
		super(ctx, env)
	}

	async init() {
		registerDocsTools(this)
	}
}

export default CloudflareDocumentationMCP.mount('/sse')
