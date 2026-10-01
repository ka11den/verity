import { describe, expect, it } from 'vitest'
import { formatPath, VerityError, v } from '../src'

describe('VerityError and Path Formatting', () => {
	it('formats path segments cleanly', () => {
		expect(formatPath([])).toBe('')
		expect(formatPath(['name'])).toBe('name')
		expect(formatPath(['user', 'name'])).toBe('user.name')
		expect(formatPath(['items', 0, 'title'])).toBe('items[0].title')
		expect(formatPath([0, 'id'])).toBe('[0].id')
	})

	it('throws VerityError on failed parse with structured issues', () => {
		const schema = v.object({
			email: v.string().email(),
			profile: v.object({
				age: v.number().min(18),
			}),
		})

		try {
			schema.parse({ email: 'bad-email', profile: { age: 10 } })
			expect.unreachable('Should have thrown')
		} catch (error) {
			expect(error).toBeInstanceOf(VerityError)
			expect(error).toBeInstanceOf(Error)

			const verityError = error as VerityError
			expect(verityError.issues).toEqual([
				{ path: ['email'], message: 'Invalid email address' },
				{ path: ['profile', 'age'], message: 'Number must be greater than or equal to 18' },
			])

			const flattened = verityError.flatten()
			expect(flattened.fieldErrors).toEqual({
				email: ['Invalid email address'],
				'profile.age': ['Number must be greater than or equal to 18'],
			})
			expect(flattened.formErrors).toEqual([])
		}
	})

	it('collects root level errors into formErrors in flatten', () => {
		const schema = v
			.object({
				a: v.number(),
				b: v.number(),
			})
			.refine((data) => data.a > data.b, 'a must be greater than b')

		const result = schema.safeParse({ a: 1, b: 2 })
		expect(result.success).toBe(false)
		if (!result.success) {
			const err = new VerityError(result.issues)
			const flat = err.flatten()
			expect(flat.formErrors).toEqual(['a must be greater than b'])
			expect(flat.fieldErrors).toEqual({})
		}
	})
})
