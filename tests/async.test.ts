import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('Async Validation', () => {
	it('supports async refinement with safeParseAsync and parseAsync', async () => {
		const takenUsernames = ['alice', 'bob']
		const isAvailable = async (username: string) => {
			await new Promise((resolve) => setTimeout(resolve, 10))
			return !takenUsernames.includes(username)
		}

		const schema = v
			.string()
			.min(3)
			.refine(async (val) => isAvailable(val), 'Username is already taken')

		const valid = await schema.safeParseAsync('charlie')
		expect(valid).toEqual({ success: true, data: 'charlie' })

		const invalid = await schema.safeParseAsync('alice')
		expect(invalid.success).toBe(false)
		if (!invalid.success) {
			expect(invalid.errors).toContain('Username is already taken')
		}

		await expect(schema.parseAsync('alice')).rejects.toThrow('Username is already taken')
	})

	it('throws error when synchronous parse encounters async refinement', () => {
		const schema = v.string().refine(async () => true, 'Always passes')

		expect(() => schema.safeParse('test')).toThrow(
			/Encountered asynchronous check during synchronous parse/,
		)
	})

	it('supports async parsing across nested object and array schemas', async () => {
		const schema = v.object({
			users: v.array(v.string().refine(async (u) => u !== 'banned', 'User is banned')),
		})

		const valid = await schema.safeParseAsync({ users: ['alex', 'kate'] })
		expect(valid).toEqual({ success: true, data: { users: ['alex', 'kate'] } })

		const invalid = await schema.safeParseAsync({ users: ['alex', 'banned'] })
		expect(invalid.success).toBe(false)
		if (!invalid.success) {
			expect(invalid.errors[0]).toBe('users[1]: User is banned')
		}
	})
})
