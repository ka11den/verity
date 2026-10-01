import {
	BaseSchema,
	createSafeError,
	createSafeErrors,
	type SafeParseResult,
	type ValidationIssue,
} from '../core/base'
import type { Infer } from '../core/types'
import type { StringSchema } from './string'

export class RecordSchema<
	ValueSchema extends BaseSchema<any>,
	KeySchema extends BaseSchema<string> = StringSchema,
> extends BaseSchema<Record<Infer<KeySchema>, Infer<ValueSchema>>> {
	constructor(
		public readonly valueSchema: ValueSchema,
		public readonly keySchema?: KeySchema,
	) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<Record<Infer<KeySchema>, Infer<ValueSchema>>> {
		if (typeof input !== 'object' || input === null || Array.isArray(input)) {
			return createSafeError(
				`Expected object, received ${input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input}`,
			)
		}

		const data: Record<any, any> = {}
		const issues: ValidationIssue[] = []

		for (const [key, value] of Object.entries(input)) {
			if (this.keySchema) {
				const keyResult = this.keySchema.safeParse(key)
				if (!keyResult.success) {
					for (const issue of keyResult.issues) {
						issues.push({
							path: [key, ...issue.path],
							message: `Invalid key: ${issue.message}`,
						})
					}
				}
			}

			const valueResult = this.valueSchema.safeParse(value)
			if (valueResult.success) {
				data[key] = valueResult.data
			} else {
				for (const issue of valueResult.issues) {
					issues.push({
						path: [key, ...issue.path],
						message: issue.message,
					})
				}
			}
		}

		if (issues.length > 0) {
			return createSafeErrors(issues)
		}

		const errors = this.runChecks(data as Record<Infer<KeySchema>, Infer<ValueSchema>>)
		if (errors.length > 0) {
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data: data as Record<Infer<KeySchema>, Infer<ValueSchema>>,
		}
	}

	public async safeParseAsync(
		input: unknown,
	): Promise<SafeParseResult<Record<Infer<KeySchema>, Infer<ValueSchema>>>> {
		if (typeof input !== 'object' || input === null || Array.isArray(input)) {
			return createSafeError(
				`Expected object, received ${input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input}`,
			)
		}

		const data: Record<any, any> = {}
		const issues: ValidationIssue[] = []

		for (const [key, value] of Object.entries(input)) {
			if (this.keySchema) {
				const keyResult = await this.keySchema.safeParseAsync(key)
				if (!keyResult.success) {
					for (const issue of keyResult.issues) {
						issues.push({
							path: [key, ...issue.path],
							message: `Invalid key: ${issue.message}`,
						})
					}
				}
			}

			const valueResult = await this.valueSchema.safeParseAsync(value)
			if (valueResult.success) {
				data[key] = valueResult.data
			} else {
				for (const issue of valueResult.issues) {
					issues.push({
						path: [key, ...issue.path],
						message: issue.message,
					})
				}
			}
		}

		if (issues.length > 0) {
			return createSafeErrors(issues)
		}

		const errors = await this.runChecksAsync(data as Record<Infer<KeySchema>, Infer<ValueSchema>>)
		if (errors.length > 0) {
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data: data as Record<Infer<KeySchema>, Infer<ValueSchema>>,
		}
	}
}
