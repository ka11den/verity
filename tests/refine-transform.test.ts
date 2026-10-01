import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('Refine and Transform', () => {
	it('supports refine for custom validation logic', () => {
		const PasswordSchema = v
			.object({
				password: v.string().min(6),
				confirm: v.string(),
			})
			.refine((data) => data.password === data.confirm, 'Passwords do not match')

		expect(
			PasswordSchema.safeParse({
				password: 'secret',
				confirm: 'secret',
			}).success,
		).toBe(true)

		const mismatch = PasswordSchema.safeParse({
			password: 'secret',
			confirm: 'different',
		})
		expect(mismatch.success).toBe(false)
		if (!mismatch.success) {
			expect(mismatch.errors).toContain('Passwords do not match')
		}
	})

	it('supports transform for data manipulation', () => {
		const schema = v
			.string()
			.transform((val) => val.trim().toLowerCase())
			.refine((val) => val.length > 0, 'Cannot be empty')

		const result = schema.safeParse('  HELLO  ')
		expect(result).toEqual({ success: true, data: 'hello' })
	})

	it('supports transform chaining with modifiers', () => {
		const schema = v
			.string()
			.transform((val) => Number(val))
			.optional()

		expect(schema.safeParse('123')).toEqual({ success: true, data: 123 })
		expect(schema.safeParse(undefined)).toEqual({ success: true, data: undefined })
	})
})
