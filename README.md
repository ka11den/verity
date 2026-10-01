# Verity

A lightweight, type-safe schema validation library for TypeScript and JavaScript with zero external dependencies.

## Features

- 🚀 **Zero Dependencies**: Ultra-lightweight footprint with no external runtime dependencies.
- 🔒 **Type-Safe**: Full static type inference with TypeScript (`Infer<typeof schema>`).
- 🛡️ **Predictable Parsing**: Support for synchronous and asynchronous safe parsing (`safeParse`, `safeParseAsync`) and throwing parsing (`parse`, `parseAsync`).
- 🧩 **Rich Schema Types**: Strings, numbers, booleans, objects, arrays, enums, literals, unions, records, dates, and type coercion.
- ✨ **Powerful Modifiers & Pipelines**: `.optional()`, `.nullable()`, `.default()`, `.refine()`, and `.transform()`.
- 🔍 **Detailed Issue Paths & Flattening**: Structured `issues` with path tracking (`users[0].email`) and `.flatten()` for form error mapping.
- 📦 **Dual Bundle**: Ready for modern ESM (`import`) and CommonJS (`require`), complete with TypeScript definitions.

## Quick Start

```typescript
// 1. Define a schema
const UserSchema = v.object({
	id: v.number().int().min(1),
	username: v.string().min(3).max(20),
	email: v.email(),
	isActive: v.boolean(),
	tags: v.array(v.string()).min(1),
	bio: v.string().optional(),
	avatar: v.string().nullable(),
	role: v.enum(['admin', 'member', 'guest'] as const).defaultValue('member'),
})

// 2. Infer static TypeScript type
type User = Infer<typeof UserSchema>

/*
type User = {
	id: number
	username: string
	email: string
	isActive: boolean
	tags: string[]
	bio?: string | undefined
	avatar: string | null
	role: 'admin' | 'member' | 'guest'
}
*/

// 3. Safe validation (returns result object)
const result = UserSchema.safeParse({
	id: 1,
	username: 'alex',
	email: 'alex@example.com',
	isActive: true,
	tags: ['typescript', 'node'],
	avatar: null,
})

if (result.success) {
	console.log('Valid user:', result.data)
} else {
	console.error('Validation errors:', result.errors)
	console.error('Structured issues:', result.issues)
}

// 4. Or parse directly (throws VerityError on failure)
const user = UserSchema.parse({
	id: 2,
	username: 'sarah',
	email: 'sarah@example.com',
	isActive: true,
	tags: ['developer'],
	avatar: null,
})
```

## API Reference

### Facade (`v` / `verity`)

```typescript
v.string()     // StringSchema
v.number()     // NumberSchema
v.boolean()    // BooleanSchema
v.email()      // StringSchema with email check
v.object(shape)// ObjectSchema
v.array(item)  // ArraySchema
v.literal(val) // LiteralSchema
v.enum(values) // EnumSchema
v.union([...]) // UnionSchema
v.record(val)  // RecordSchema
v.date()       // DateSchema
v.any()        // AnySchema
v.unknown()    // UnknownSchema
v.coerce       // Type coercion helpers (string, number, boolean, date)
```

### String Schema (`v.string()`)

- `.min(length: number, message?: string)`: Minimum length.
- `.max(length: number, message?: string)`: Maximum length.
- `.length(length: number, message?: string)`: Exact length.
- `.email(message?: string)`: RFC-compliant email validation.
- `.url(message?: string)`: Valid URL address (`http:` / `https:`).
- `.uuid(message?: string)`: Valid UUID format.
- `.regex(pattern: RegExp, message?: string)`: Custom regex check.
- `.startsWith(prefix: string, message?: string)`: String prefix check.
- `.endsWith(suffix: string, message?: string)`: String suffix check.
- `.includes(substr: string, message?: string)`: Substring check.
- `.trim()`: Trims whitespace before running validations.

```typescript
const schema = v.string().trim().min(3).max(100).email('Invalid email')
```

### Number Schema (`v.number()`)

- `.min(min: number, message?: string)`: Minimum numerical value (`>= min`).
- `.max(max: number, message?: string)`: Maximum numerical value (`<= max`).
- `.int(message?: string)`: Must be an integer (`Number.isInteger`).
- `.positive(message?: string)`: Value must be `> 0`.
- `.nonnegative(message?: string)`: Value must be `>= 0`.
- `.negative(message?: string)`: Value must be `< 0`.
- `.nonpositive(message?: string)`: Value must be `<= 0`.
- `.finite(message?: string)`: Must be a finite number (`Number.isFinite`).
- `.multipleOf(step: number, message?: string)`: Must be a multiple of `step`.

```typescript
const priceSchema = v.number().positive().multipleOf(0.01)
```

### Boolean Schema (`v.boolean()`)

Validates boolean values (`true` or `false`). Rejects non-boolean truthy/falsy values (`1`, `0`, `'true'`).

```typescript
const flagSchema = v.boolean()
```

### Array Schema (`v.array(elementSchema)`)

Validates arrays and checks each element against `elementSchema`:

- `.min(length: number, message?: string)`: Minimum array length.
- `.max(length: number, message?: string)`: Maximum array length.
- `.length(length: number, message?: string)`: Exact array length.
- `.nonempty(message?: string)`: Array must have at least 1 element.

```typescript
const tagsSchema = v.array(v.string().min(1)).min(1).max(5)
```

### Object Schema (`v.object(shape)`)

Validates structured objects with precise nested error path tracking:

```typescript
const profileSchema = v.object({
	name: v.string().min(1),
	age: v.number().min(18),
})
```

#### Object Modes:

- `.strip()`: (Default) Strips unknown keys from the parsed result.
- `.passthrough()`: Keeps unknown keys in the parsed result.
- `.strict(message?: string)`: Returns a validation error if unrecognized keys are present.

#### Schema Composition:

- `.extend(newFields)`: Returns a new `ObjectSchema` merging existing and new properties.
- `.pick(['key1', 'key2'])`: Returns a schema with only selected keys.
- `.omit(['key1'])`: Returns a schema excluding selected keys.
- `.partial()`: Makes all properties optional.

```typescript
const BaseUser = v.object({ id: v.number(), name: v.string() })
const AdminUser = BaseUser.extend({ permissions: v.array(v.string()) })
```

### Enum & Literal Schemas

```typescript
// Literal
const roleAdmin = v.literal('admin')

// Enum
const statusSchema = v.enum(['active', 'pending', 'suspended'] as const)
```

### Union & Record Schemas

```typescript
// Union
const idSchema = v.union([v.string(), v.number()])

// Record
const scoresSchema = v.record(v.number()) // Record<string, number>
const customKeys = v.record(v.number(), v.string().startsWith('tag_'))
```

### Date Schema (`v.date()`)

Validates `Date` instances:

- `.min(minDate: Date, message?: string)`: Date must be on or after `minDate`.
- `.max(maxDate: Date, message?: string)`: Date must be on or before `maxDate`.

```typescript
const pastDate = v.date().max(new Date())
```

### Type Coercion (`v.coerce`)

Coerces input values before validation:

```typescript
v.coerce.string() // String(val)
v.coerce.number() // Number(val)
v.coerce.boolean() // Boolean(val)
v.coerce.date() // new Date(val)
```

### Modifiers, Refinements & Transformations

Every schema supports chaining:

#### `.optional()`

Accepts `undefined` as valid data. The inferred type will have `?` on object keys:

```typescript
const schema = v.string().optional()
```

#### `.nullable()`

Accepts `null` as valid data:

```typescript
const schema = v.number().nullable()
```

#### `.default(value)` / `.defaultValue(value)`

Fallback when input is `undefined`. Supports static values or factory functions:

```typescript
const schema = v.string().default('anonymous')
const timestamp = v.number().default(() => Date.now())
```

#### `.refine(predicate, message?)`

Custom validation logic (sync or async):

```typescript
const Passwords = v
	.object({
		password: v.string().min(8),
		confirm: v.string(),
	})
	.refine((data) => data.password === data.confirm, 'Passwords do not match')
```

#### `.transform(fn)`

Transform data during validation:

```typescript
const NumString = v.string().transform((val) => Number(val))
```

### Error Handling & Flattening

When validation fails, `VerityError` provides structured information:

```typescript
try {
	UserSchema.parse(invalidData)
} catch (error) {
	if (error instanceof VerityError) {
		console.log(error.issues)
		// [
		//   { path: ['username'], message: 'String must contain at least 3 character(s)' },
		//   { path: ['tags', 0], message: 'Expected string, received number' }
		// ]

		const { fieldErrors, formErrors } = error.flatten()
		console.log(fieldErrors)
		// {
		//   "username": ["String must contain at least 3 character(s)"],
		//   "tags[0]": ["Expected string, received number"]
		// }
	}
}
```

### Asynchronous Validation

Verity natively supports async validations and refinements:

```typescript
const UsernameSchema = v.string().refine(async (username) => {
	const available = await checkAvailability(username)
	return available
}, 'Username already taken')

// Use safeParseAsync or parseAsync
const result = await UsernameSchema.safeParseAsync('alice')
```

## Development

```bash
# Run tests
npm test

# Type check
npm run typecheck

# Lint with Biome
npm run lint

# Format code with Biome
npm run format

# Build bundle (ESM + CJS + .d.ts)
npm run build
```

## License

[MIT](LICENSE)
