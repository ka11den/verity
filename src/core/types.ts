import type { BaseSchema } from './base'

export type Validator<T> = (val: T) => string | null

export type SafeParseResult<T> = { success: true; data: T } | { success: false; errors: string[] }

export type Infer<T extends BaseSchema<any>> = T['_output']

export type SchemaShape = Record<string, BaseSchema<any>>

export type InferShape<T extends SchemaShape> = {
	[K in keyof T]: Infer<T[K]>
}
