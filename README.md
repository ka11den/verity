# Verity

A lightweight, type-safe schema validation library for TypeScript and JavaScript with zero external dependencies.

## Features

- 🚀 **Zero Dependencies**: Ultra-lightweight footprint with no external runtime dependencies.
- 🔒 **Type-Safe**: Full static type inference with TypeScript (`Infer<typeof schema>`).
- 🛡️ **Predictable Parsing**: Support for both safe parsing (`safeParse`) and throwing parsing (`parse`).
- 🧩 **Composable Modifiers**: Fluent API for `.optional()`, `.nullable()`, and `.default()` / `.defaultValue()`.
- 📧 **Built-in Validations**: String length, integers, range checks, and email validation.
- 📦 **Dual Bundle**: Ready for modern ESM (`import`) and CommonJS (`require`), complete with TypeScript definitions.

## Quick Start

```typescript
// 1. Define a schema
const UserSchema = v.object({
	id: v.number().int().min(1),
	username: v.string().min(3).max(20),
	email: v.email(),
	isActive: v.boolean(),
	bio: v.string().optional(),
	avatar: v.string().nullable(),
	role: v.string().defaultValue('member'),
})

// 2. Infer static TypeScript type
type User = Infer<typeof UserSchema>

/*
type User = {
	id: number
	username: string
	email: string
	isActive: boolean
	bio?: string | undefined
	avatar: string | null
	role: string
}
*/

// 3. Safe validation (returns result object)
const result = UserSchema.safeParse({
	id: 1,
	username: 'alex',
	email: 'alex@example.com',
	isActive: true,
	avatar: null,
})

if (result.success) {
	console.log('Valid user:', result.data)
} else {
	console.error('Validation errors:', result.errors)
}

// 4. Or parse directly (throws Error on failure)
const user = UserSchema.parse({
	id: 2,
	username: 'sarah',
	email: 'sarah@example.com',
	isActive: true,
	avatar: null,
})
```

## API Reference

### Facade (`v` / `verity`)

You can build schemas using `v` or the `verity` alias:

```typescript
v.string() // StringSchema
v.number() // NumberSchema
v.boolean() // BooleanSchema
v.email() // StringSchema with email validation
v.object() // ObjectSchema
```

### String Schema (`v.string()`)

- `.min(length: number, message?: string)`: Minimum string length.
- `.max(length: number, message?: string)`: Maximum string length.
- `.email(message?: string)`: Validates RFC-compliant email address format.

```typescript
const schema = v.string().min(2).max(100).email('Invalid email address')
```

### Number Schema (`v.number()`)

- `.min(min: number, message?: string)`: Minimum numerical value.
- `.max(max: number, message?: string)`: Maximum numerical value.
- `.int(message?: string)`: Must be an integer (`Number.isInteger`).

```typescript
const ageSchema = v.number().int().min(0).max(120)
```

### Boolean Schema (`v.boolean()`)

Validates boolean values (`true` or `false`). Rejects non-boolean truthy/falsy values (`1`, `0`, `'true'`).

```typescript
const flagSchema = v.boolean()
```

### Modifiers

Every schema supports fluent modifier chaining:

#### `.optional()`

Accepts `undefined` as valid data. The inferred type will be `T | undefined`.

```typescript
const schema = v.string().optional()
schema.safeParse(undefined) // { success: true, data: undefined }
```

#### `.nullable()`

Accepts `null` as valid data. The inferred type will be `T | null`.

```typescript
const schema = v.number().nullable()
schema.safeParse(null) // { success: true, data: null }
```

#### `.default(value)` / `.defaultValue(value)`

Fallback value when input is `undefined`. Supports static values or factory functions. The inferred type is `T` (not undefined).

```typescript
// Static default value
const roleSchema = v.string().default('user')
roleSchema.safeParse(undefined) // { success: true, data: 'user' }

// Factory function
const timestampSchema = v.number().defaultValue(() => Date.now())
```

### Object Schema (`v.object(shape)`)

Validates structured objects with field-level error messages:

```typescript
const profileSchema = v.object({
	name: v.string().min(1),
	age: v.number().min(18),
})

const result = profileSchema.safeParse({ name: '', age: 16 })

if (!result.success) {
	console.log(result.errors)
	// [
	//   'name: String must contain at least 1 character(s)',
	//   'age: Number must be greater than or equal to 18'
	// ]
}
```

### Parsing Methods

#### `safeParse(input: unknown): SafeParseResult<T>`

Returns a tagged union:

- `{ success: true, data: T }`
- `{ success: false, errors: string[] }`

#### `parse(input: unknown): T`

Returns validated data directly or throws an `Error` containing comma-separated messages.

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
