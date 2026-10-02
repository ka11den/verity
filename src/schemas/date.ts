import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeError, createSafeErrors } from '../core/errors.js'

export class DateSchema extends BaseSchema<Date> {
	public safeParse(input: unknown): SafeParseResult<Date> {
		if (!(input instanceof Date) || Number.isNaN(input.getTime()))
			return createSafeError(
				`Expected Date, received ${input instanceof Date ? 'Invalid Date' : typeof input}`,
			)

		const errors = this.runChecks(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<Date>> {
		if (!(input instanceof Date) || Number.isNaN(input.getTime()))
			return createSafeError(
				`Expected Date, received ${input instanceof Date ? 'Invalid Date' : typeof input}`,
			)

		const errors = await this.runChecksAsync(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input,
		}
	}

	public min(minDate: Date, message?: string): this {
		this.checks.push((value: Date) => {
			if (value.getTime() < minDate.getTime())
				return message ?? `Date must be greater than or equal to ${minDate.toISOString()}`

			return null
		})

		return this
	}

	public max(maxDate: Date, message?: string): this {
		this.checks.push((value: Date) => {
			if (value.getTime() > maxDate.getTime())
				return message ?? `Date must be less than or equal to ${maxDate.toISOString()}`

			return null
		})

		return this
	}
}
