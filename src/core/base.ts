import type { DefaultSchema } from '../modifiers/default.js'
import type { NullableSchema } from '../modifiers/nullable.js'
import type { OptionalSchema } from '../modifiers/optional.js'
import type { TransformSchema } from '../modifiers/transform.js'
import { VerityError } from './errors.js'
import type { SafeParseResult, Validator } from './types.js'
import { isPromise } from './utils.js'

export type {
	Infer,
	SafeParseResult,
	ValidationIssue,
	Validator,
} from './types.js'

export abstract class BaseSchema<Output> {
	declare readonly _output: Output

	protected checks: Validator<Output>[] = []

	private static _registry: {
		Optional?: new <T>(inner: BaseSchema<T>) => BaseSchema<T | undefined>
		Nullable?: new <T>(inner: BaseSchema<T>) => BaseSchema<T | null>
		Default?: new <T>(inner: BaseSchema<T>, dv: T | (() => T)) => BaseSchema<T>
		Transform?: new <I, O>(inner: BaseSchema<I>, fn: (v: I) => O | Promise<O>) => BaseSchema<O>
	} = {}

	public static registerModifiers(entries: Partial<typeof BaseSchema._registry>): void {
		Object.assign(BaseSchema._registry, entries)
	}

	public parse(input: unknown): Output {
		const result = this.safeParse(input)

		if (!result.success) throw new VerityError(result.issues)

		return result.data
	}

	public async parseAsync(input: unknown): Promise<Output> {
		const result = await this.safeParseAsync(input)

		if (!result.success) throw new VerityError(result.issues)

		return result.data
	}

	public abstract safeParse(input: unknown): SafeParseResult<Output>

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<Output>> {
		return this.safeParse(input)
	}

	protected runChecks(value: Output): string[] {
		const errors: string[] = []

		for (const check of this.checks) {
			const error = check(value)
			if (isPromise<string | null | undefined>(error))
				throw new Error(
					'Encountered asynchronous check during synchronous parse; use parseAsync() or safeParseAsync() instead.',
				)

			if (error) errors.push(error)
		}

		return errors
	}

	protected async runChecksAsync(value: Output): Promise<string[]> {
		const errors: string[] = []

		for (const check of this.checks) {
			const error = await check(value)

			if (error) errors.push(error)
		}

		return errors
	}

	public refine(
		predicate: (value: Output) => boolean | Promise<boolean>,
		message: string | ((value: Output) => string) = 'Invalid value',
	): this {
		this.checks.push((value: Output) => {
			const result = predicate(value)
			if (isPromise<boolean>(result)) {
				return result.then((valid) => {
					if (!valid) return typeof message === 'function' ? message(value) : message

					return null
				})
			}
			if (!result) return typeof message === 'function' ? message(value) : message

			return null
		})

		return this
	}

	public transform<NewOutput>(
		fn: (value: Output) => NewOutput | Promise<NewOutput>,
	): TransformSchema<Output, NewOutput> {
		const { Transform } = BaseSchema._registry

		if (!Transform) throw new Error('TransformSchema is not registered.')

		return new Transform(this, fn) as unknown as TransformSchema<Output, NewOutput>
	}

	public optional(): OptionalSchema<Output> {
		const { Optional } = BaseSchema._registry

		if (!Optional) throw new Error('OptionalSchema is not registered.')

		return new Optional(this) as unknown as OptionalSchema<Output>
	}

	public nullable(): NullableSchema<Output> {
		const { Nullable } = BaseSchema._registry

		if (!Nullable) throw new Error('NullableSchema is not registered.')

		return new Nullable(this) as unknown as NullableSchema<Output>
	}

	public default(defaultValue: Output | (() => Output)): DefaultSchema<Output> {
		const { Default } = BaseSchema._registry

		if (!Default) throw new Error('DefaultSchema is not registered.')

		return new Default(this, defaultValue) as unknown as DefaultSchema<Output>
	}

	public defaultValue(defaultValue: Output | (() => Output)): DefaultSchema<Output> {
		return this.default(defaultValue)
	}
}

export { createSafeError, createSafeErrors, VerityError } from './errors.js'
export { formatPath } from './utils.js'
