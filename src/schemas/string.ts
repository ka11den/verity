import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeError, createSafeErrors } from '../core/errors.js'
import { emailValidator } from '../validators/email.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class StringSchema extends BaseSchema<string> {
	private isTrimmed = false

	public safeParse(input: unknown): SafeParseResult<string> {
		if (typeof input !== 'string')
			return createSafeError(`Expected string, received ${typeof input}`)

		const val = this.isTrimmed ? input.trim() : input
		const errors = this.runChecks(val)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: val,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<string>> {
		if (typeof input !== 'string')
			return createSafeError(`Expected string, received ${typeof input}`)

		const val = this.isTrimmed ? input.trim() : input
		const errors = await this.runChecksAsync(val)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: val,
		}
	}

	public trim(): this {
		this.isTrimmed = true

		return this
	}

	public min(length: number, message?: string): this {
		this.checks.push((value) => {
			if (value.length < length)
				return message ?? `String must contain at least ${length} character(s)`

			return null
		})

		return this
	}

	public max(length: number, message?: string): this {
		this.checks.push((value) => {
			if (value.length > length)
				return message ?? `String must contain at most ${length} character(s)`

			return null
		})

		return this
	}

	public length(length: number, message?: string): this {
		this.checks.push((value) => {
			if (value.length !== length)
				return message ?? `String must contain exactly ${length} character(s)`

			return null
		})

		return this
	}

	public email(message?: string): this {
		this.checks.push(emailValidator(message))

		return this
	}

	public regex(pattern: RegExp, message?: string): this {
		this.checks.push((value) => {
			if (!pattern.test(value)) return message ?? 'Invalid string format'

			return null
		})

		return this
	}

	public url(message?: string): this {
		this.checks.push((value) => {
			try {
				const parsed = new URL(value)

				if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
					return message ?? 'Invalid URL'

				return null
			} catch {
				return message ?? 'Invalid URL'
			}
		})
		return this
	}

	public uuid(message?: string): this {
		this.checks.push((value) => {
			if (!UUID_REGEX.test(value)) return message ?? 'Invalid UUID'

			return null
		})

		return this
	}

	public startsWith(prefix: string, message?: string): this {
		this.checks.push((value) => {
			if (!value.startsWith(prefix)) return message ?? `String must start with "${prefix}"`

			return null
		})

		return this
	}

	public endsWith(suffix: string, message?: string): this {
		this.checks.push((value) => {
			if (!value.endsWith(suffix)) return message ?? `String must end with "${suffix}"`

			return null
		})

		return this
	}

	public includes(substr: string, message?: string): this {
		this.checks.push((value) => {
			if (!value.includes(substr)) return message ?? `String must contain "${substr}"`

			return null
		})

		return this
	}
}
