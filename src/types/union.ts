import { BaseSchema, createSafeError, createSafeErrors, type SafeParseResult } from '../core/base'
import type { Infer } from '../core/types'

export class UnionSchema<
	T extends readonly [BaseSchema<any>, ...BaseSchema<any>[]],
> extends BaseSchema<Infer<T[number]>> {
	constructor(public readonly schemas: T) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<Infer<T[number]>> {
		for (const schema of this.schemas) {
			const result = schema.safeParse(input)
			if (result.success) {
				const errors = this.runChecks(result.data)
				if (errors.length > 0) {
					return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
				}
				return {
					success: true,
					data: result.data,
				}
			}
		}

		return createSafeError('Input does not match any schema in the union')
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<Infer<T[number]>>> {
		for (const schema of this.schemas) {
			const result = await schema.safeParseAsync(input)
			if (result.success) {
				const errors = await this.runChecksAsync(result.data)
				if (errors.length > 0) {
					return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
				}
				return {
					success: true,
					data: result.data,
				}
			}
		}

		return createSafeError('Input does not match any schema in the union')
	}
}
