import type { SafeParseResult, Validator } from './types'

export type { Infer, SafeParseResult, Validator } from './types'

export abstract class BaseSchema<Output> {
	declare readonly _output: Output

	protected checks: Validator<Output>[] = []

	public parse(input: unknown): Output {
		const result = this.safeParse(input)

		if (!result.success) throw new Error(result.errors.join(', '))

		return result.data
	}

	abstract safeParse(input: unknown): SafeParseResult<Output>

	protected runChecks(value: Output): string[] {
		const errors: string[] = []

		for (const check of this.checks) {
			const error = check(value)

			if (error) errors.push(error)
		}

		return errors
	}

	public optional(): OptionalSchema<Output> {
		return new OptionalSchema(this)
	}

	public nullable(): NullableSchema<Output> {
		return new NullableSchema(this)
	}

	public default(defaultValue: Output | (() => Output)): DefaultSchema<Output> {
		return new DefaultSchema(this, defaultValue)
	}

	public defaultValue(defaultValue: Output | (() => Output)): DefaultSchema<Output> {
		return this.default(defaultValue)
	}
}

export class OptionalSchema<T> extends BaseSchema<T | undefined> {
	constructor(protected readonly innerSchema: BaseSchema<T>) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<T | undefined> {
		if (input === undefined) {
			return {
				success: true,
				data: undefined,
			}
		}

		return this.innerSchema.safeParse(input)
	}
}

export class NullableSchema<T> extends BaseSchema<T | null> {
	constructor(protected readonly innerSchema: BaseSchema<T>) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<T | null> {
		if (input === null) {
			return {
				success: true,
				data: null,
			}
		}

		return this.innerSchema.safeParse(input)
	}
}

export class DefaultSchema<T> extends BaseSchema<T> {
	protected readonly _defaultValue: T | (() => T)

	constructor(
		protected readonly innerSchema: BaseSchema<T>,
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
		if (input === undefined) {
			return {
				success: true,
				data: this.getDefaultValue(),
			}
		}

		return this.innerSchema.safeParse(input)
	}
}
