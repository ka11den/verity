import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeError, createSafeErrors } from '../core/errors.js'

export class NumberSchema extends BaseSchema<number> {
	public safeParse(input: unknown): SafeParseResult<number> {
		if (typeof input !== 'number' || Number.isNaN(input))
			return createSafeError(
				`Expected number, received ${Number.isNaN(input) ? 'NaN' : typeof input}`,
			)

		const errors = this.runChecks(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<number>> {
		if (typeof input !== 'number' || Number.isNaN(input))
			return createSafeError(
				`Expected number, received ${Number.isNaN(input) ? 'NaN' : typeof input}`,
			)

		const errors = await this.runChecksAsync(input)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: input,
		}
	}

	public min(min: number, message?: string): this {
		this.checks.push((value: number) => {
			if (value < min) return message ?? `Number must be greater than or equal to ${min}`

			return null
		})

		return this
	}

	public max(max: number, message?: string): this {
		this.checks.push((value: number) => {
			if (value > max) return message ?? `Number must be less than or equal to ${max}`

			return null
		})

		return this
	}

	public int(message?: string): this {
		this.checks.push((value: number) => {
			if (!Number.isInteger(value)) return message ?? 'Number must be an integer'

			return null
		})

		return this
	}

	public positive(message?: string): this {
		this.checks.push((value: number) => {
			if (value <= 0) return message ?? 'Number must be positive'

			return null
		})

		return this
	}

	public nonnegative(message?: string): this {
		this.checks.push((value: number) => {
			if (value < 0) return message ?? 'Number must be non-negative'

			return null
		})

		return this
	}

	public negative(message?: string): this {
		this.checks.push((value: number) => {
			if (value >= 0) return message ?? 'Number must be negative'

			return null
		})

		return this
	}

	public nonpositive(message?: string): this {
		this.checks.push((value: number) => {
			if (value > 0) return message ?? 'Number must be non-positive'

			return null
		})

		return this
	}

	public finite(message?: string): this {
		this.checks.push((value: number) => {
			if (!Number.isFinite(value)) return message ?? 'Number must be finite'

			return null
		})

		return this
	}

	public multipleOf(step: number, message?: string): this {
		this.checks.push((value: number) => {
			if (step <= 0) return 'Step must be greater than 0'

			const quotient = value / step
			const isMultiple = Math.abs(quotient - Math.round(quotient)) < 1e-10

			if (!isMultiple) return message ?? `Number must be a multiple of ${step}`

			return null
		})

		return this
	}
}
