import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeError, createSafeErrors } from '../core/errors.js'

export class EnumSchema<
	T extends readonly [string, ...string[]] | readonly string[],
> extends BaseSchema<T[number]> {
	constructor(public readonly values: T) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<T[number]> {
		if (typeof input !== 'string' || !this.values.includes(input)) {
			return createSafeError(
				`Expected one of [${this.values.map((v) => `'${v}'`).join(', ')}], received ${JSON.stringify(input)}`,
			)
		}

		const errors = this.runChecks(input as T[number])

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input as T[number],
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T[number]>> {
		if (typeof input !== 'string' || !this.values.includes(input))
			return createSafeError(
				`Expected one of [${this.values.map((v) => `'${v}'`).join(', ')}], received ${JSON.stringify(input)}`,
			)

		const errors = await this.runChecksAsync(input as T[number])

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input as T[number],
		}
	}
}
