import type { BaseSchema } from './base.js'

export interface ValidationIssue {
	path: (string | number)[]
	message: string
}

export type Validator<T> = (
	val: T,
) => string | null | undefined | Promise<string | null | undefined>

export type SafeParseSuccess<T> = {
	success: true
	data: T
}

export type SafeParseError = {
	success: false
	errors: string[]
	issues: ValidationIssue[]
}

export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError

export type Infer<T extends BaseSchema<any>> = T['_output']

export type SchemaShape = Record<string, BaseSchema<any>>

export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

type OptionalKeys<T extends SchemaShape> = {
	[K in keyof T]: undefined extends Infer<T[K]> ? K : never
}[keyof T]

type RequiredKeys<T extends SchemaShape> = {
	[K in keyof T]: undefined extends Infer<T[K]> ? never : K
}[keyof T]

export type InferShape<T extends SchemaShape> = Prettify<
	{ [K in OptionalKeys<T>]?: Infer<T[K]> } & {
		[K in RequiredKeys<T>]: Infer<T[K]>
	}
>
