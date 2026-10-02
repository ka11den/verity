import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeErrors } from '../core/errors.js'

export class UnknownSchema extends BaseSchema<unknown> {
	public safeParse(input: unknown): SafeParseResult<unknown> {
		const errors = this.runChecks(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<unknown>> {
		const errors = await this.runChecksAsync(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input,
		}
	}
}
