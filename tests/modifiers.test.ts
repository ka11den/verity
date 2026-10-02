import { describe, expect, it } from 'vitest'
import type { Infer } from '../src/core/base'
import { NumberSchema } from '../src/schemas/number'
import { ObjectSchema } from '../src/schemas/object'
import { StringSchema } from '../src/schemas/string'

describe('Modifiers (optional, nullable, default)', () => {
	it('optional should allow undefined and validate provided value', () => {
		const schema = new StringSchema().min(3).optional()

		type SchemaType = Infer<typeof schema>

		expect(schema.safeParse(undefined).success).toBe(true)
		expect(schema.safeParse('hello').success).toBe(true)
		expect(schema.safeParse('hi').success).toBe(false)
		expect(schema.safeParse(123).success).toBe(false)
	})

	it('nullable should allow null and validate provided value', () => {
		const schema = new NumberSchema().nullable()

		type SchemaType = Infer<typeof schema>

		expect(schema.safeParse(null).success).toBe(true)
		expect(schema.safeParse(42).success).toBe(true)
		expect(schema.safeParse('42').success).toBe(false)
	})

	it('should work inside ObjectSchema', () => {
		const userSchema = new ObjectSchema({
			name: new StringSchema(),
			bio: new StringSchema().optional(),
			age: new NumberSchema().nullable(),
		})

		const res = userSchema.safeParse({
			name: 'Bob',
			age: null,
		})

		expect(res.success).toBe(true)
	})

	it('default/defaultValue should fallback to default value when undefined', () => {
		const schema = new StringSchema().default('anonymous')

		type SchemaType = Infer<typeof schema>

		const resUndefined = schema.safeParse(undefined)
		expect(resUndefined.success).toBe(true)

		if (resUndefined.success) expect(resUndefined.data).toBe('anonymous')

		const resProvided = schema.safeParse('john')
		expect(resProvided.success).toBe(true)

		if (resProvided.success) expect(resProvided.data).toBe('john')

		expect(schema.safeParse(123).success).toBe(false)
	})

	it('defaultValue should support factory function for value generation', () => {
		let count = 0
		const schema = new NumberSchema().defaultValue(() => ++count)

		expect(schema.parse(undefined)).toBe(1)
		expect(schema.parse(undefined)).toBe(2)
		expect(schema.parse(42)).toBe(42)
	})

	it('defaultValue should work inside ObjectSchema', () => {
		const userSchema = new ObjectSchema({
			role: new StringSchema().defaultValue('user'),
			score: new NumberSchema().default(0),
		})

		const res = userSchema.safeParse({})
		expect(res.success).toBe(true)

		if (res.success) expect(res.data).toEqual({ role: 'user', score: 0 })
	})
})
