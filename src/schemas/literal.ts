import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeError, createSafeErrors } from '../core/errors.js'

export class LiteralSchema<
	T extends string | number | boolean | null | undefined,
> extends BaseSchema<T> {
	constructor(public readonly value: T) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<T> {
		if (input !== this.value)
			return createSafeError(
				`Expected literal ${JSON.stringify(this.value)}, received ${JSON.stringify(input)}`,
			)

		const errors = this.runChecks(input as T)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input as T,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T>> {
		if (input !== this.value)
			return createSafeError(
				`Expected literal ${JSON.stringify(this.value)}, received ${JSON.stringify(input)}`,
			)

		const errors = await this.runChecksAsync(input as T)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input as T,
		}
	}
}
