import { describe, expect, it } from 'vitest'
import { type Infer, v } from '../src'

describe('ObjectSchema', () => {
	it('validates matching object shape', () => {
		const schema = v.object({
			name: v.string(),
			age: v.number(),
		})

		const result = schema.safeParse({ name: 'Alice', age: 30 })
		expect(result).toEqual({
			success: true,
			data: { name: 'Alice', age: 30 },
		})
	})

	it('strips unknown keys by default', () => {
		const schema = v.object({
			name: v.string(),
		})

		const result = schema.safeParse({ name: 'Alice', extra: 123 })
		expect(result).toEqual({
			success: true,
			data: { name: 'Alice' },
		})
	})

	it('passes through unknown keys when passthrough is enabled', () => {
		const schema = v
			.object({
				name: v.string(),
			})
			.passthrough()

		const result = schema.safeParse({ name: 'Alice', extra: 123 })
		expect(result).toEqual({
			success: true,
			data: { name: 'Alice', extra: 123 },
		})
	})

	it('rejects unknown keys when strict is enabled', () => {
		const schema = v
			.object({
				name: v.string(),
			})
			.strict()

		const result = schema.safeParse({ name: 'Alice', extra: 123 })
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errors[0]).toContain("Unrecognized key(s) in object: 'extra'")
		}
	})

	it('extends existing schema', () => {
		const base = v.object({ name: v.string() })
		const extended = base.extend({ age: v.number() })

		expect(extended.safeParse({ name: 'Bob', age: 25 })).toEqual({
			success: true,
			data: { name: 'Bob', age: 25 },
		})
	})

	it('picks and omits fields', () => {
		const schema = v.object({
			a: v.string(),
			b: v.number(),
			c: v.boolean(),
		})

		const picked = schema.pick(['a', 'b'])
		expect(picked.safeParse({ a: 'hi', b: 10 })).toEqual({
			success: true,
			data: { a: 'hi', b: 10 },
		})

		const omitted = schema.omit(['c'])
		expect(omitted.safeParse({ a: 'hi', b: 10 })).toEqual({
			success: true,
			data: { a: 'hi', b: 10 },
		})
	})

	it('creates partial schema', () => {
		const schema = v
			.object({
				name: v.string(),
				age: v.number(),
			})
			.partial()

		expect(schema.safeParse({})).toEqual({
			success: true,
			data: { name: undefined, age: undefined },
		})
	})

	it('allows omission of optional keys in static TypeScript type', () => {
		const UserSchema = v.object({
			name: v.string(),
			bio: v.string().optional(),
		})

		type User = Infer<typeof UserSchema>
		const user: User = { name: 'Alex' } // verifies bio? is truly optional in TS!
		expect(user.name).toBe('Alex')
	})

	it('formats nested path errors', () => {
		const schema = v.object({
			user: v.object({
				email: v.string().email(),
			}),
		})

		const result = schema.safeParse({ user: { email: 'invalid' } })
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errors[0]).toBe('user.email: Invalid email address')
			expect(result.issues[0]).toEqual({
				path: ['user', 'email'],
				message: 'Invalid email address',
			})
		}
	})
})
