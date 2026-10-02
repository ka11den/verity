import { BaseSchema } from '../core/base.js'
import type { SafeParseResult } from '../core/types.js'

export class OptionalSchema<T> extends BaseSchema<T | undefined> {
	constructor(public readonly innerSchema: BaseSchema<T>) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<T | undefined> {
		if (input === undefined) return { success: true, data: undefined }

		return this.innerSchema.safeParse(input)
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T | undefined>> {
		if (input === undefined) return { success: true, data: undefined }

		return this.innerSchema.safeParseAsync(input)
	}
}

BaseSchema.registerModifiers({
	Optional: OptionalSchema as new <T>(inner: BaseSchema<T>) => BaseSchema<T | undefined>,
})
