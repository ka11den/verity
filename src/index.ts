import type { BaseSchema } from './core/base.js'
import type { SchemaShape } from './core/types.js'
import {
	AnySchema,
	ArraySchema,
	BooleanSchema,
	CoerceBooleanSchema,
	CoerceDateSchema,
	CoerceNumberSchema,
	CoerceStringSchema,
	DateSchema,
	EnumSchema,
	LiteralSchema,
	NumberSchema,
	ObjectSchema,
	RecordSchema,
	StringSchema,
	UnionSchema,
	UnknownSchema,
} from './schemas/index.js'

export const verity = {
	string: () => new StringSchema(),
	number: () => new NumberSchema(),
	boolean: () => new BooleanSchema(),
	email: (message?: string) => new StringSchema().email(message),
	object: <T extends SchemaShape>(shape: T) => new ObjectSchema(shape),
	array: <T extends BaseSchema<any>>(schema: T) => new ArraySchema(schema),
	literal: <T extends string | number | boolean | null | undefined>(value: T) =>
		new LiteralSchema(value),
	enum: <T extends readonly [string, ...string[]] | readonly string[]>(values: T) =>
		new EnumSchema(values),
	union: <T extends readonly [BaseSchema<any>, ...BaseSchema<any>[]]>(schemas: T) =>
		new UnionSchema(schemas),
	record: <
		ValueSchema extends BaseSchema<any>,
		KeySchema extends BaseSchema<string> = StringSchema,
	>(
		valueSchema: ValueSchema,
		keySchema?: KeySchema,
	) => new RecordSchema(valueSchema, keySchema),
	date: () => new DateSchema(),
	any: () => new AnySchema(),
	unknown: () => new UnknownSchema(),
	coerce: {
		string: () => new CoerceStringSchema(),
		number: () => new CoerceNumberSchema(),
		boolean: () => new CoerceBooleanSchema(),
		date: () => new CoerceDateSchema(),
	},
}

export const v = verity

export { BaseSchema } from './core/base.js'
export {
	createSafeError,
	createSafeErrors,
	VerityError,
} from './core/errors.js'
export type {
	Infer,
	InferShape,
	Prettify,
	SafeParseError,
	SafeParseResult,
	SafeParseSuccess,
	SchemaShape,
	ValidationIssue,
	Validator,
} from './core/types.js'
export { formatPath, isPromise } from './core/utils.js'
export {
	DefaultSchema,
	NullableSchema,
	OptionalSchema,
	TransformSchema,
} from './modifiers/index.js'
export {
	AnySchema,
	ArraySchema,
	BooleanSchema,
	CoerceBooleanSchema,
	CoerceDateSchema,
	CoerceNumberSchema,
	CoerceStringSchema,
	DateSchema,
	EnumSchema,
	LiteralSchema,
	NumberSchema,
	ObjectSchema,
	RecordSchema,
	StringSchema,
	UnionSchema,
	UnknownSchema,
} from './schemas/index.js'
export { EMAIL_REGEX, emailValidator, isEmail } from './validators/index.js'
