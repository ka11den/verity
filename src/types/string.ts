import { BaseSchema, type SafeParseResult } from '../core/base'
import { emailValidator } from '../validators/email'

export class StringSchema extends BaseSchema<string> {
	public safeParse(input: unknown): SafeParseResult<string> {
		if (typeof input !== 'string') {
			return {
				success: false,
				errors: [`Expected string, received ${typeof input}`],
			}
		}

		const errors = this.runChecks(input)

		if (errors.length > 0) return { success: false, errors }

		return {
			success: true,
			data: input,
		}
	}

	public min(length: number, message?: string) {
		this.checks.push((value) => {
			if (value.length < length)
				return message ?? `String must contain at least ${length} character(s)`

			return null
		})

		return this
	}

	public max(length: number, message?: string) {
		this.checks.push((value) => {
			if (value.length > length)
				return message ?? `String must contain at most ${length} character(s)`

			return null
		})

		return this
	}

	public email(message?: string) {
		this.checks.push(emailValidator(message))
		return this
	}
}
