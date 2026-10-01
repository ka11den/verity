import {
	BaseSchema,
	createSafeError,
	createSafeErrors,
	type SafeParseResult,
	type ValidationIssue,
} from '../core/base'
import type { Infer } from '../core/types'

export class ArraySchema<T extends BaseSchema<any>> extends BaseSchema<Infer<T>[]> {
	constructor(public readonly elementSchema: T) {
		super()
	}

	public min(length: number, message?: string): this {
		this.checks.push((value: Infer<T>[]) => {
			if (value.length < length) {
				return message ?? `Array must contain at least ${length} element(s)`
			}
			return null
		})
		return this
	}

	public max(length: number, message?: string): this {
		this.checks.push((value: Infer<T>[]) => {
			if (value.length > length) {
				return message ?? `Array must contain at most ${length} element(s)`
			}
			return null
		})
		return this
	}

	public length(length: number, message?: string): this {
		this.checks.push((value: Infer<T>[]) => {
			if (value.length !== length) {
				return message ?? `Array must contain exactly ${length} element(s)`
			}
			return null
		})
		return this
	}

	public nonempty(message?: string): this {
		return this.min(1, message ?? 'Array must not be empty')
	}

	public safeParse(input: unknown): SafeParseResult<Infer<T>[]> {
		if (!Array.isArray(input)) {
			return createSafeError(`Expected array, received ${input === null ? 'null' : typeof input}`)
		}

		const data: Infer<T>[] = []
		const issues: ValidationIssue[] = []

		for (let i = 0; i < input.length; i++) {
			const result = this.elementSchema.safeParse(input[i])
			if (result.success) {
				data.push(result.data)
			} else {
				for (const subIssue of result.issues) {
					issues.push({
						path: [i, ...subIssue.path],
						message: subIssue.message,
					})
				}
			}
		}

		if (issues.length > 0) {
			return createSafeErrors(issues)
		}

		const arrayErrors = this.runChecks(data)
		if (arrayErrors.length > 0) {
			return createSafeErrors(arrayErrors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<Infer<T>[]>> {
		if (!Array.isArray(input)) {
			return createSafeError(`Expected array, received ${input === null ? 'null' : typeof input}`)
		}

		const data: Infer<T>[] = []
		const issues: ValidationIssue[] = []

		for (let i = 0; i < input.length; i++) {
			const result = await this.elementSchema.safeParseAsync(input[i])
			if (result.success) {
				data.push(result.data)
			} else {
				for (const subIssue of result.issues) {
					issues.push({
						path: [i, ...subIssue.path],
						message: subIssue.message,
					})
				}
			}
		}

		if (issues.length > 0) {
			return createSafeErrors(issues)
		}

		const arrayErrors = await this.runChecksAsync(data)
		if (arrayErrors.length > 0) {
			return createSafeErrors(arrayErrors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data,
		}
	}
}
