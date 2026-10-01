import type { SchemaShape } from './core/types'
import { BooleanSchema } from './types/boolean'
import { NumberSchema } from './types/number'
import { ObjectSchema } from './types/object'
import { StringSchema } from './types/string'

export const verity = {
	string: () => new StringSchema(),
	number: () => new NumberSchema(),
	boolean: () => new BooleanSchema(),
	email: (message?: string) => new StringSchema().email(message),
	object: <T extends SchemaShape>(shape: T) => new ObjectSchema(shape),
}

export const v = verity

export { BaseSchema } from './core/base'
export type {
	Infer,
	InferShape,
	SafeParseResult,
	SchemaShape,
	Validator,
} from './core/types'
export { DefaultSchema, NullableSchema, OptionalSchema } from './modifiers'
export {
	BooleanSchema,
	NumberSchema,
	ObjectSchema,
	StringSchema,
} from './types'
export { EMAIL_REGEX, emailValidator, isEmail } from './validators'
