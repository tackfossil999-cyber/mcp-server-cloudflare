import { MetricsEvent, MetricsEventIndexIds, mapBlobs, mapDoubles } from "./analytics-engine"

export class ToolCall implements MetricsEvent {
	constructor(
		private toolCall: {
			userId?: string
            sessionId?: string
            toolName: string
			errorCode?: number
		}
	) {}

	toDataPoint(): AnalyticsEngineDataPoint {
        return {
            indexes: [MetricsEventIndexIds.TOOL_CALL],
            blobs: mapBlobs({
				blob3: this.toolCall.userId,
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
			sessionId?: string,
			clientInfo?: {
				name: string,
				version: string
			}
		}
	) {}

	toDataPoint(): AnalyticsEngineDataPoint {
        return {
            indexes: [MetricsEventIndexIds.SESSION_START],
            blobs: mapBlobs({
				blob3: this.session.userId,
				blob4: this.session.sessionId,
				blob5: this.session.clientInfo?.name,
				blob6: this.session.clientInfo?.version,
			}),
        }
	}
}

export class AuthUser implements MetricsEvent {
	constructor(
		private authUser: {
			userId?: string,
			errorMessage?: string
		}
	) {}

	toDataPoint(): AnalyticsEngineDataPoint {
        return {
            indexes: [MetricsEventIndexIds.SESSION_START],
            blobs: mapBlobs({
				blob3: this.authUser.userId,
				blob4: this.authUser.errorMessage
			}),
        }
	}
}
