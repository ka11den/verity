export function formatPath(path: ReadonlyArray<string | number>): string {
	return path.reduce<string>((acc, segment, index) => {
		if (index === 0) return typeof segment === 'number' ? `[${segment}]` : String(segment)

		return typeof segment === 'number' ? `${acc}[${segment}]` : `${acc}.${segment}`
	}, '')
}

export function isPromise<T>(value: unknown): value is Promise<T> {
	return (
		value !== null &&
		(typeof value === 'object' || typeof value === 'function') &&
		typeof (value as Record<string, unknown>).then === 'function'
	)
}
