import { BaseSchema } from '../core/base.js'
import { createSafeErrors } from '../core/errors.js'
import type { SafeParseResult } from '../core/types.js'
import { isPromise } from '../core/utils.js'

export class TransformSchema<Input, Output> extends BaseSchema<Output> {
	constructor(
		public readonly innerSchema: BaseSchema<Input>,
		public readonly transformFn: (value: Input) => Output | Promise<Output>,
	) {
		super()
	}

	public safeParse(input: unknown): SafeParseResult<Output> {
		const innerResult = this.innerSchema.safeParse(input)

		if (!innerResult.success) return innerResult

		const transformed = this.transformFn(innerResult.data)

		if (isPromise<Output>(transformed))
			throw new Error(
				'Encountered asynchronous transform during synchronous parse; use parseAsync() or safeParseAsync() instead.',
			)

		const errors = this.runChecks(transformed)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: transformed,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<Output>> {
		const innerResult = await this.innerSchema.safeParseAsync(input)

		if (!innerResult.success) return innerResult

		const transformed = await this.transformFn(innerResult.data)
		const errors = await this.runChecksAsync(transformed)

		if (errors.length > 0)
			return createSafeErrors(errors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: transformed,
		}
	}
}

BaseSchema.registerModifiers({
	Transform: TransformSchema as new <I, O>(
		inner: BaseSchema<I>,
		fn: (v: I) => O | Promise<O>,
	) => BaseSchema<O>,
})
