import { describe, expect, it } from 'vitest'
import { StringSchema } from '../src/types/string'

describe('StringSchema', () => {
	it('should return success: true for a valid string', () => {
		const schema = new StringSchema().min(3).max(10)
		const res = schema.safeParse('hello')

		expect(res.success).toBe(true)

		if (res.success) expect(res.data).toBe('hello')
	})

	it('should return errors without throwing exceptions', () => {
		const schema = new StringSchema().min(5)
		const res = schema.safeParse('hi')

		expect(res.success).toBe(false)

		if (!res.success) expect(res.errors.length).toBeGreaterThan(0)
	})
})
