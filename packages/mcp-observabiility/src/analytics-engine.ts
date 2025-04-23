/**
 * Generic metrics event utilities
 * @description Wrapper for RA binding
 */
export class MetricsTracker {
	constructor(
		private wae: AnalyticsEngineDataset,
		//private env: MetricsBindings['ENVIRONMENT']
	) {}

	logEvent(event: MetricsEvent): void {
		try {
			this.wae.writeDataPoint(event.toDataPoint())
		} catch (e) {
			console.error(`Failed to log metrics event, ${e}`)
			// rethrow errors in vitest, but failsafe in other environments
			/*if (this.env === 'VITEST') {
				throw e
			}*/
		}
	}
}

/**
 * MetricsEvent
 *
 * Each event type is stored with a different indexId and has an associated class which
 * maps a more ergonomic event object to a ReadyAnalyticsEvent
 */
export interface MetricsEvent {
	toDataPoint(): AnalyticsEngineDataPoint
}

export enum MetricsEventIndexIds {
	AUTH_USER = 'auth_user',
	SESSION_START = 'session_start',
	TOOL_CALL = 'tool_call',
}

/**
 * Utility functions to map named blob/double objects to an array
 * We do this so we don't have to annotate `blob1`, `blob2`, etc in comments.
 *
 * I prefer this to just writing it in an array because it'll be easier to reference
 * later when we are writing ready analytics queries.
 *
 * IMO named tuples and raw arrays aren't as ergonomic to work with, but they require less of this code below
 */
type Range1To20 =
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 18
	| 19
	| 20

type Blobs = {
	[key in `blob${Range1To20}`]?: string | null
}

type Doubles = {
	[key in `double${Range1To20}`]?: number
}

export class MetricsError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'MetricsError'
	}
}

export function mapBlobs(blobs: Blobs): Array<string | null> {
	const blobsArray = new Array(Object.keys(blobs).length)
	for (const [key, value] of Object.entries(blobs)) {
		const match = key.match(/^blob(\d+)$/)
		if (match === null || match.length < 2) {
			// we should never hit this because of the typedefinitions above,
			// but this error is for safety
			throw new MetricsError('Failed to map blobs, invalid key')
		}
		const index = parseInt(match[1], 10)
		if (isNaN(index)) {
			// we should never hit this because of the typedefinitions above,
			// but this error is for safety
			throw new MetricsError('Failed to map blobs, invalid index')
		}
		if (index - 1 >= blobsArray.length) {
			throw new MetricsError('Failed to map blobs, missing blob')
		}
		blobsArray[index - 1] = value
	}
	return blobsArray
}

export function mapDoubles(doubles: Doubles): number[] {
	const doublesArray = new Array(Object.keys(doubles).length)
	for (const [key, value] of Object.entries(doubles)) {
		const match = key.match(/^double(\d+)$/)
		if (match === null || match.length < 2) {
			// we should never hit this because of the typedefinitions above,
			// but this error is for safety
			throw new MetricsError(': Failed to map doubles, invalid key')
		}
		const index = parseInt(match[1], 10)
		if (isNaN(index)) {
			// we should never hit this because of the typedefinitions above,
			// but this error is for safety
			throw new MetricsError('Failed to map doubles, invalid index')
		}
		if (index - 1 >= doublesArray.length) {
			throw new MetricsError('Failed to map doubles, missing blob')
		}
		doublesArray[index - 1] = value
	}
	return doublesArray
}
