import { describe, expect, it } from 'vitest'
import type { Infer } from '../src/core/base'
import { NumberSchema } from '../src/types/number'
import { ObjectSchema } from '../src/types/object'
import { StringSchema } from '../src/types/string'

describe('ObjectSchema', () => {
	it('should correctly validate an object and return data', () => {
		const userSchema = new ObjectSchema({
			name: new StringSchema().min(2),
			age: new NumberSchema().int().min(18),
		})

		type User = Infer<typeof userSchema>

		const validData = { name: 'Alice', age: 25 }
		const res = userSchema.safeParse(validData)

		expect(res.success).toBe(true)

		if (res.success) expect(res.data).toEqual({ name: 'Alice', age: 25 })
	})

	it('should collect field-specific errors for invalid data', () => {
		const userSchema = new ObjectSchema({
			name: new StringSchema().min(2),
			age: new NumberSchema().min(18),
		})

		const res = userSchema.safeParse({ name: 'A', age: 10 })

		expect(res.success).toBe(false)

		if (!res.success) {
			expect(res.errors).toContain('name: String must contain at least 2 character(s)')
			expect(res.errors).toContain('age: Number must be greater than or equal to 18')
		}
	})

	it('should reject null and arrays', () => {
		const schema = new ObjectSchema({ name: new StringSchema() })

		expect(schema.safeParse(null).success).toBe(false)
		expect(schema.safeParse([]).success).toBe(false)
		expect(schema.safeParse('string').success).toBe(false)
	})
})
