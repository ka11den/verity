import { BaseSchema, type SafeParseResult } from '../core/base.js'
import { createSafeError, createSafeErrors } from '../core/errors.js'
import type { Infer, InferShape, Prettify, SchemaShape } from '../core/types.js'
import type { OptionalSchema } from '../modifiers/optional.js'

export type { InferShape, SchemaShape } from '../core/types.js'

export class ObjectSchema<T extends SchemaShape> extends BaseSchema<InferShape<T>> {
	private mode: 'strip' | 'passthrough' | 'strict' = 'strip'
	private strictMessage?: string

	constructor(public readonly shape: T) {
		super()
	}

	public strip(): this {
		this.mode = 'strip'

		return this
	}

	public passthrough(): this {
		this.mode = 'passthrough'

		return this
	}

	public strict(message?: string): this {
		this.mode = 'strict'
		this.strictMessage = message

		return this
	}

	public extend<U extends SchemaShape>(extension: U): ObjectSchema<Prettify<T & U>> {
		return new ObjectSchema({ ...this.shape, ...extension })
	}

	public pick<K extends keyof T>(keys: K[]): ObjectSchema<Prettify<Pick<T, K>>> {
		const pickedShape = {} as Pick<T, K>
		for (const key of keys) {
			if (key in this.shape) pickedShape[key] = this.shape[key]
		}

		return new ObjectSchema(pickedShape)
	}

	public omit<K extends keyof T>(keys: K[]): ObjectSchema<Prettify<Omit<T, K>>> {
		const omittedShape = { ...this.shape } as any

		for (const key of keys) delete omittedShape[key]

		return new ObjectSchema(omittedShape)
	}

	public partial(): ObjectSchema<{
		[K in keyof T]: OptionalSchema<Infer<T[K]>>
	}> {
		const partialShape = {} as any

		for (const [key, schema] of Object.entries(this.shape)) {
			partialShape[key] = schema.optional()
		}

		return new ObjectSchema(partialShape)
	}

	public safeParse(input: unknown): SafeParseResult<InferShape<T>> {
		if (typeof input !== 'object' || input === null || Array.isArray(input))
			return createSafeError(
				`Expected object, received ${input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input}`,
			)

		const inputObj = input as Record<string, unknown>
		const data: Record<string, any> = {}
		const issues: { path: (string | number)[]; message: string }[] = []

		if (this.mode === 'strict') {
			const unknownKeys = Object.keys(inputObj).filter((k) => !(k in this.shape))
			if (unknownKeys.length > 0) {
				const message =
					this.strictMessage ?? `Unrecognized key(s) in object: '${unknownKeys.join("', '")}'`
				issues.push({ path: [], message })
			}
		} else if (this.mode === 'passthrough') {
			for (const key of Object.keys(inputObj)) {
				if (!(key in this.shape)) {
					data[key] = inputObj[key]
				}
			}
		}

		for (const [key, schema] of Object.entries(this.shape)) {
			const rawValue = inputObj[key]
			const result = schema.safeParse(rawValue)

			if (result.success) {
				data[key] = result.data
			} else {
				for (const subIssue of result.issues) {
					issues.push({
						path: [key, ...subIssue.path],
						message: subIssue.message,
					})
				}
			}
		}

		if (issues.length > 0) return createSafeErrors(issues)

		const objectErrors = this.runChecks(data as InferShape<T>)

		if (objectErrors.length > 0)
			return createSafeErrors(objectErrors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: data as InferShape<T>,
		}
	}

	public async safeParseAsync(input: unknown): Promise<SafeParseResult<InferShape<T>>> {
		if (typeof input !== 'object' || input === null || Array.isArray(input))
			return createSafeError(
				`Expected object, received ${input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input}`,
			)

		const inputObj = input as Record<string, unknown>
		const data: Record<string, any> = {}
		const issues: { path: (string | number)[]; message: string }[] = []

		if (this.mode === 'strict') {
			const unknownKeys = Object.keys(inputObj).filter((k) => !(k in this.shape))
			if (unknownKeys.length > 0) {
				const message =
					this.strictMessage ?? `Unrecognized key(s) in object: '${unknownKeys.join("', '")}'`
				issues.push({ path: [], message })
			}
		} else if (this.mode === 'passthrough') {
			for (const key of Object.keys(inputObj)) {
				if (!(key in this.shape)) {
					data[key] = inputObj[key]
				}
			}
		}

		for (const [key, schema] of Object.entries(this.shape)) {
			const rawValue = inputObj[key]
			const result = await schema.safeParseAsync(rawValue)
			if (result.success) {
				data[key] = result.data
			} else {
				for (const subIssue of result.issues) {
					issues.push({
						path: [key, ...subIssue.path],
						message: subIssue.message,
					})
				}
			}
		}

		if (issues.length > 0) return createSafeErrors(issues)

		const objectErrors = await this.runChecksAsync(data as InferShape<T>)

		if (objectErrors.length > 0)
			return createSafeErrors(objectErrors.map((msg) => ({ path: [], message: msg })))

		return {
			success: true,
			data: data as InferShape<T>,
		}
	}
}
