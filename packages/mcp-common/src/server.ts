import { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { type ServerOptions } from "@modelcontextprotocol/sdk/server/index.js"
import { MetricsTracker, SessionStart, ToolCall } from '@repo/mcp-observability';
import { ZodRawShape } from 'zod';
import { McpError } from './mcp-error';

export class CloudflareMCPServer extends McpServer {
    private metrics;

	constructor(
        userId: string | undefined,
        wae: AnalyticsEngineDataset,
		serverInfo: {
			[x: string]: unknown
			name: string
			version: string
		},
		options?: ServerOptions
	) {
		super(serverInfo, options)
        this.metrics = new MetricsTracker(wae, serverInfo)

        this.server.oninitialized = () => {
            const sessionId = this.server.transport?.sessionId
            const clientInfo = this.server.getClientVersion()
            this.metrics.logEvent(new SessionStart({
                userId,
                sessionId,
                clientInfo
            }))
        }

        const _tool = this.tool.bind(this);
        this.tool = (name: string, ...rest: unknown[]): ReturnType<typeof this.tool> => {
            const baseToolCallback = rest[rest.length - 1] as ToolCallback<ZodRawShape | undefined>
            rest[rest.length - 1] = (args: Parameters<ToolCallback<ZodRawShape | undefined>>) => {
                const sessionId = args.length === 2 ? args[1].sessionId : args[0].sessionId
                // @ts-ignore there's a weird typescript issue where it uses | instead of &
                return baseToolCallback(...args)
                    .then(() => {
                        this.metrics.logEvent(new ToolCall({
                            userId,
                            sessionId,
                            toolName: name
                        }))
                    })
                    .catch((e: any) => {
                        let errorCode = -1
                        if (e instanceof McpError) {
                            errorCode = e.code
                        }
                        this.metrics.logEvent(new ToolCall({
                            userId,
                            sessionId,
                            toolName: name,
                            errorCode: errorCode
                        }))

                        throw e
                    })
            }

            // @ts-ignore 
            return _tool(name, ...rest)
        }
	}
}
