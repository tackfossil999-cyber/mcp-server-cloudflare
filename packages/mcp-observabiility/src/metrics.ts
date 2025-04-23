import { MetricsEvent, MetricsEventIndexIds, mapBlobs, mapDoubles } from "./analytics-engine"

export type MetricsBindings = {
    MCP_METRICS: AnalyticsEngineDataset
}

export class ToolCall implements MetricsEvent {
	constructor(
		private toolCall: {
			userId?: string
            mcpServer: string
			mcpServerVersion: string
            sessionId: string
            toolName: string
			errorCode?: number
		}
	) {}

	toDataPoint(): AnalyticsEngineDataPoint {
        return {
            indexes: [MetricsEventIndexIds.TOOL_CALL],
            blobs: mapBlobs({
				blob1: this.toolCall.userId,
				blob2: this.toolCall.mcpServer,
				blob3: this.toolCall.mcpServerVersion,
				blob4: this.toolCall.sessionId,
				blob5: this.toolCall.toolName,
			}),
			doubles: mapDoubles({
				double1: this.toolCall.errorCode
			})
        }
	}
}

export class SessionStart implements MetricsEvent {
	constructor(
		private session: {
			userId?: string,
			mcpServer: string,
			mcpServerVersion: string,
			sessionId: string,
			client: string
		}
	) {}

	toDataPoint(): AnalyticsEngineDataPoint {
        return {
            indexes: [MetricsEventIndexIds.SESSION_START],
            blobs: mapBlobs({
				blob1: this.session.userId,
				blob2: this.session.mcpServer,
				blob3: this.session.mcpServerVersion,
				blob4: this.session.sessionId,
				blob5: this.session.client,
			}),
        }
	}
}

export class AuthUser implements MetricsEvent {
	constructor(
		private authUser: {
			userId?: string,
			mcpServer: string,
			mcpServerVersion: string,
			errorMessage?: string
		}
	) {}

	toDataPoint(): AnalyticsEngineDataPoint {
        return {
            indexes: [MetricsEventIndexIds.SESSION_START],
            blobs: mapBlobs({
				blob1: this.authUser.userId,
				blob2: this.authUser.mcpServer,
				blob3: this.authUser.mcpServerVersion,
				blob4: this.authUser.errorMessage
			}),
        }
	}
}
