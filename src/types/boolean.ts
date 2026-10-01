import { BaseSchema, type SafeParseResult } from '../core/base'

export class BooleanSchema extends BaseSchema<boolean> {
	public safeParse(input: unknown): SafeParseResult<boolean> {
		if (typeof input !== 'boolean') {
			return {
				success: false,
				errors: [`Expected boolean, received ${typeof input}`],
			}
		}

		const errors = this.runChecks(input)

		if (errors.length > 0) return { success: false, errors }

		return {
			success: true,
			data: input,
		}
	}
}
