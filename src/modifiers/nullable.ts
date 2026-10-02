import { BaseSchema } from '../core/base.js'
import type { SafeParseResult } from '../core/types.js'

export class NullableSchema<T> extends BaseSchema<T | null> {
	constructor(public readonly innerSchema: BaseSchema<T>) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<T | null> {
		if (input === null) return { success: true, data: null }

		return this.innerSchema.safeParse(input)
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T | null>> {
		if (input === null) return { success: true, data: null }

		return this.innerSchema.safeParseAsync(input)
	}
}

BaseSchema.registerModifiers({
	Nullable: NullableSchema as new <T>(inner: BaseSchema<T>) => BaseSchema<T | null>,
})
