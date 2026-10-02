import { BaseSchema } from '../core/base.js'
import type { SafeParseResult } from '../core/types.js'

export class DefaultSchema<T> extends BaseSchema<T> {
	protected readonly _defaultValue: T | (() => T)

	constructor(
		public readonly innerSchema: BaseSchema<T>,
		defaultValue: T | (() => T),
	) {
		super()
		this._defaultValue = defaultValue
	}

	public getDefaultValue(): T {
		return typeof this._defaultValue === 'function'
			? (this._defaultValue as () => T)()
			: this._defaultValue
	}

	public safeParse(input: unknown): SafeParseResult<T> {
		if (input === undefined) return { success: true, data: this.getDefaultValue() }

		return this.innerSchema.safeParse(input)
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T>> {
		if (input === undefined) return { success: true, data: this.getDefaultValue() }

		return this.innerSchema.safeParseAsync(input)
	}
}

BaseSchema.registerModifiers({
	Default: DefaultSchema as new <T>(inner: BaseSchema<T>, dv: T | (() => T)) => BaseSchema<T>,
})
