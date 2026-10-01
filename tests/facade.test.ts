import { describe, expect, it } from 'vitest'
import { type Infer, v } from '../src/index'

describe('verity facade (v)', () => {
	it('should declaratively build schemas and infer types', () => {
		const UserSchema = v.object({
			id: v.number().int().min(1),
			username: v.string().min(3).max(20),
			isActive: v.boolean(),
			bio: v.string().optional(),
			karma: v.number().nullable(),
		})

		type User = Infer<typeof UserSchema>

		const validData = {
			id: 1,
			username: 'alex',
			isActive: true,
			karma: null,
		}

		const res = UserSchema.safeParse(validData)

		expect(res.success).toBe(true)

		if (res.success) {
			expect(res.data.username).toBe('alex')
			expect(res.data.karma).toBeNull()
			expect(res.data.bio).toBeUndefined()
		}

		const invalidRes = UserSchema.safeParse({
			id: 0,
			username: 'al',
			isActive: 'yes',
			karma: 'none',
		})

		expect(invalidRes.success).toBe(false)

		if (!invalidRes.success) expect(invalidRes.errors.length).toBeGreaterThanOrEqual(4)
	})
})
