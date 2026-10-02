import { describe, expect, it } from 'vitest'
import type { Infer } from '../src/core/base'
import { BooleanSchema } from '../src/schemas/boolean'

describe('BooleanSchema', () => {
	it('should accept true and false', () => {
		const schema = new BooleanSchema()

		type B = Infer<typeof schema>

		expect(schema.safeParse(true)).toEqual({ success: true, data: true })
		expect(schema.safeParse(false)).toEqual({ success: true, data: false })
	})

	it('should reject non-boolean truthy and falsy values', () => {
		const schema = new BooleanSchema()

		expect(schema.safeParse(1).success).toBe(false)
		expect(schema.safeParse(0).success).toBe(false)
		expect(schema.safeParse('true').success).toBe(false)
		expect(schema.safeParse(null).success).toBe(false)
		expect(schema.safeParse(undefined).success).toBe(false)
	})

	it('should support .optional() and .nullable() modifiers', () => {
		const optionalBool = new BooleanSchema().optional()
		const nullableBool = new BooleanSchema().nullable()

		expect(optionalBool.safeParse(undefined).success).toBe(true)
		expect(nullableBool.safeParse(null).success).toBe(true)
	})
})
