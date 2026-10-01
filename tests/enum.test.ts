import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('EnumSchema', () => {
	it('validates enum values', () => {
		const roles = ['admin', 'user', 'guest'] as const
		const schema = v.enum(roles)

		expect(schema.safeParse('admin')).toEqual({ success: true, data: 'admin' })
		expect(schema.safeParse('user')).toEqual({ success: true, data: 'user' })
		expect(schema.safeParse('guest')).toEqual({ success: true, data: 'guest' })
		expect(schema.safeParse('superadmin').success).toBe(false)
		expect(schema.safeParse(123).success).toBe(false)
	})
})
