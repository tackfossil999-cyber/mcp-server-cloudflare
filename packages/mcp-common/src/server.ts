import { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { InitializedNotificationSchema, ClientCapabilities } from "@modelcontextprotocol/sdk/types.js"
import { type ServerOptions } from "@modelcontextprotocol/sdk/server/index.js"
import { MetricsTracker, SessionStart, ToolCall } from '@repo/mcp-observability';
import { ZodRawShape, ZodType } from 'zod';
import { McpError } from './mcp-error';
import { isPromise } from 'node:util/types'

export class CloudflareMCPServer extends McpServer {
    private metrics;

	constructor(
        private userId: string | undefined,
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
            const clientInfo = this.server.getClientVersion()
            const clientCapabilities = this.server.getClientCapabilities()
            this.metrics.logEvent(new SessionStart({
                userId,
                clientInfo,
                clientCapabilities
            }))
        }

        const _tool = this.tool.bind(this);
        this.tool = (name: string, ...rest: unknown[]): ReturnType<typeof this.tool> => {
            const toolCb = rest[rest.length - 1] as ToolCallback<ZodRawShape | undefined>
            const replacementToolCb: ToolCallback<ZodRawShape | undefined> = (arg1, arg2) => {
                const toolCall = toolCb(arg1 as { [x: string]: any; } & { signal: AbortSignal }, arg2)
                // There are 4 cases to track:
                try {
                    if (isPromise(toolCall)) {
                        return toolCall
                            .then((r) => {
                                // promise succeeds
                                this.metrics.logEvent(new ToolCall({
                                    userId,
                                    toolName: name
                                }))
                                return r
                            })
                            .catch((e) => {
                                // promise throws
                                this.trackToolCallError(e, name)
                                throw e
                            })
                    } else {
                        // non-promise succeeds
                        this.metrics.logEvent(new ToolCall({
                            userId,
                            toolName: name
                        }))
                        return toolCall
                    }
                } catch (e) {
                    // non-promise throws
                    this.trackToolCallError(e, name)
                    throw e
                }
            }
            rest[rest.length - 1] = replacementToolCb

            // @ts-ignore
            return _tool(name, ...rest)
        }
	}

    private trackToolCallError(e: any, toolName: string) {
        let errorCode = -1
        if (e instanceof McpError) {
            errorCode = e.code
        }
        this.metrics.logEvent(new ToolCall({
            toolName,
            userId: this.userId,
            errorCode: errorCode
        }))
    }
}