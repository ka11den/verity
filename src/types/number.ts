import { BaseSchema, type SafeParseResult } from '../core/base'

export class NumberSchema extends BaseSchema<number> {
	public safeParse(input: unknown): SafeParseResult<number> {
		if (typeof input !== 'number' || Number.isNaN(input)) {
			return {
				success: false,
				errors: [`Expected number, received ${Number.isNaN(input) ? 'NaN' : typeof input}`],
			}
		}

		const errors = this.runChecks(input)

		if (errors.length > 0) return { success: false, errors }

		return {
			success: true,
			data: input,
		}
	}

	public min(min: number, message?: string) {
		this.checks.push((value: number) => {
			if (value < min) return message ?? `Number must be greater than or equal to ${min}`

			return null
		})

		return this
	}

	public max(max: number, message?: string) {
		this.checks.push((value: number) => {
			if (value > max) return message ?? `Number must be less than or equal to ${max}`

			return null
		})

		return this
	}

	public int(message?: string) {
		this.checks.push((value: number) => {
			if (!Number.isInteger(value)) return message ?? 'Number must be an integer'

			return null
		})

		return this
	}
}
