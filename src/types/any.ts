import { BaseSchema, createSafeErrors, type SafeParseResult } from '../core/base'

export class AnySchema extends BaseSchema<any> {
	public safeParse(input: unknown): SafeParseResult<any> {
		const errors = this.runChecks(input)
		if (errors.length > 0) {
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data: input,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<any>> {
		const errors = await this.runChecksAsync(input)
		if (errors.length > 0) {
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data: input,
		}
	}
}
