import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeError, createSafeErrors } from '../core/errors.js'

export class BooleanSchema extends BaseSchema<boolean> {
	public safeParse(input: unknown): SafeParseResult<boolean> {
		if (typeof input !== 'boolean')
			return createSafeError(`Expected boolean, received ${typeof input}`)

		const errors = this.runChecks(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<boolean>> {
		if (typeof input !== 'boolean')
			return createSafeError(`Expected boolean, received ${typeof input}`)

		const errors = await this.runChecksAsync(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return { success: true, data: input }
	}
}
