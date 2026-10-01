import type { SafeParseError, SafeParseResult, ValidationIssue, Validator } from './types'

export type { Infer, SafeParseResult, ValidationIssue, Validator } from './types'

export function formatPath(path: (string | number)[]): string {
	return path.reduce<string>((acc, segment, index) => {
		if (index === 0) {
			return typeof segment === 'number' ? `[${segment}]` : String(segment)
		}
		return typeof segment === 'number' ? `${acc}[${segment}]` : `${acc}.${segment}`
	}, '')
}

export function createSafeError(message: string, path: (string | number)[] = []): SafeParseError {
	const formatted = path.length > 0 ? `${formatPath(path)}: ${message}` : message
	return {
		success: false,
		errors: [formatted],
		issues: [{ path, message }],
	}
}

export function createSafeErrors(issues: ValidationIssue[]): SafeParseError {
	const errors = issues.map((issue) =>
		issue.path.length > 0 ? `${formatPath(issue.path)}: ${issue.message}` : issue.message,
	)
	return {
		success: false,
		errors,
		issues,
	}
}

export class VerityError extends Error {
	public readonly errors: string[]
	public readonly issues: ValidationIssue[]

	constructor(issues: ValidationIssue[] | string[]) {
		const normalizedIssues: ValidationIssue[] =
			issues.length > 0 && typeof issues[0] === 'string'
				? (issues as string[]).map((message) => ({ path: [], message }))
				: (issues as ValidationIssue[])

		const errorStrings = normalizedIssues.map((issue) =>
			issue.path.length > 0 ? `${formatPath(issue.path)}: ${issue.message}` : issue.message,
		)

		super(errorStrings.join(', '))
		this.name = 'VerityError'
		this.issues = normalizedIssues
		this.errors = errorStrings

		Object.setPrototypeOf(this, VerityError.prototype)
	}

	public flatten(): { formErrors: string[]; fieldErrors: Record<string, string[]> } {
		const formErrors: string[] = []
		const fieldErrors: Record<string, string[]> = {}

		for (const issue of this.issues) {
			if (issue.path.length === 0) {
				formErrors.push(issue.message)
			} else {
				const key = formatPath(issue.path)
				if (!fieldErrors[key]) {
					fieldErrors[key] = []
				}
				fieldErrors[key].push(issue.message)
			}
		}

		return { formErrors, fieldErrors }
	}
}

export abstract class BaseSchema<Output> {
	declare readonly _output: Output

	protected checks: Validator<Output>[] = []

	public parse(input: unknown): Output {
		const result = this.safeParse(input)

		if (!result.success) {
			throw new VerityError(result.issues)
		}

		return result.data
	}

	public async parseAsync(input: unknown): Promise<Output> {
		const result = await this.safeParseAsync(input)

		if (!result.success) {
			throw new VerityError(result.issues)
		}

		return result.data
	}

	abstract safeParse(input: unknown): SafeParseResult<Output>

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<Output>> {
		return this.safeParse(input)
	}

	protected runChecks(value: Output): string[] {
		const errors: string[] = []

		for (const check of this.checks) {
			const error = check(value)

			if (error && typeof (error as any).then === 'function') {
				throw new Error(
					'Encountered asynchronous check during synchronous parse; use parseAsync() or safeParseAsync() instead.',
				)
			}

			if (error) {
				errors.push(error as string)
			}
		}

		return errors
	}

	protected async runChecksAsync(value: Output): Promise<string[]> {
		const errors: string[] = []

		for (const check of this.checks) {
			const error = await check(value)

			if (error) {
				errors.push(error)
			}
		}

		return errors
	}

	public refine(
		predicate: (value: Output) => boolean | Promise<boolean>,
		message: string | ((value: Output) => string) = 'Invalid value',
	): this {
		this.checks.push((value: Output) => {
			const result = predicate(value)

			if (result && typeof (result as any).then === 'function') {
				return (result as Promise<boolean>).then((valid) => {
					if (!valid) {
						return typeof message === 'function' ? message(value) : message
					}
					return null
				})
			}

			if (!result) {
				return typeof message === 'function' ? message(value) : message
			}

			return null
		})

		return this
	}

	public transform<NewOutput>(
		fn: (value: Output) => NewOutput | Promise<NewOutput>,
	): TransformSchema<Output, NewOutput> {
		return new TransformSchema(this, fn)
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
	constructor(public readonly innerSchema: BaseSchema<T>) {
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

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T | undefined>> {
		if (input === undefined) {
			return {
				success: true,
				data: undefined,
			}
		}

		return this.innerSchema.safeParseAsync(input)
	}
}

export class NullableSchema<T> extends BaseSchema<T | null> {
	constructor(public readonly innerSchema: BaseSchema<T>) {
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

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T | null>> {
		if (input === null) {
			return {
				success: true,
				data: null,
			}
		}

		return this.innerSchema.safeParseAsync(input)
	}
}

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
		if (input === undefined) {
			return {
				success: true,
				data: this.getDefaultValue(),
			}
		}

		return this.innerSchema.safeParse(input)
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<T>> {
		if (input === undefined) {
			return {
				success: true,
				data: this.getDefaultValue(),
			}
		}

		return this.innerSchema.safeParseAsync(input)
	}
}

export class TransformSchema<Input, Output> extends BaseSchema<Output> {
	constructor(
		public readonly innerSchema: BaseSchema<Input>,
		public readonly transformFn: (value: Input) => Output | Promise<Output>,
	) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<Output> {
		const innerResult = this.innerSchema.safeParse(input)

		if (!innerResult.success) {
			return innerResult
		}

		const transformed = this.transformFn(innerResult.data)

		if (transformed && typeof (transformed as any).then === 'function') {
			throw new Error(
				'Encountered asynchronous transform during synchronous parse; use parseAsync() or safeParseAsync() instead.',
			)
		}

		const output = transformed as Output
		const errors = this.runChecks(output)

		if (errors.length > 0) {
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data: output,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<Output>> {
		const innerResult = await this.innerSchema.safeParseAsync(input)

		if (!innerResult.success) {
			return innerResult
		}

		const transformed = await this.transformFn(innerResult.data)
		const errors = await this.runChecksAsync(transformed)

		if (errors.length > 0) {
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))
		}

		return {
			success: true,
			data: transformed,
		}
	}
}
