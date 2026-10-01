import { BaseSchema } from '../core/base'
import type { InferShape, SafeParseResult, SchemaShape } from '../core/types'

export type { InferShape, SchemaShape } from '../core/types'

export class ObjectSchema<T extends SchemaShape> extends BaseSchema<InferShape<T>> {
	constructor(private shape: T) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<InferShape<T>> {
		if (typeof input !== 'object' || input === null || Array.isArray(input)) {
			return {
				success: false,
				errors: [
					`Expected object, received ${input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input}`,
				],
			}
		}

		const data: Record<string, any> = {}
		const errors: string[] = []

		for (const [key, schema] of Object.entries(this.shape)) {
			const rawValue = (input as Record<string, unknown>)[key]
			const result = schema.safeParse(rawValue)

			if (result.success) {
				data[key] = result.data
			} else {
				errors.push(...result.errors.map((err) => `${key}: ${err}`))
			}
		}

		if (errors.length > 0)
			return {
				success: false,
				errors,
			}

		const objectErrors = this.runChecks(data as InferShape<T>)
		if (objectErrors.length > 0)
			return {
				success: false,
				errors: objectErrors,
			}

		return {
			success: true,
			data: data as InferShape<T>,
		}
	}
}
