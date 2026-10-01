import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('LiteralSchema', () => {
	it('validates string literals', () => {
		const schema = v.literal('admin')
		expect(schema.safeParse('admin')).toEqual({ success: true, data: 'admin' })
		expect(schema.safeParse('user').success).toBe(false)
	})

	it('validates number and boolean literals', () => {
		const num = v.literal(42)
		expect(num.safeParse(42)).toEqual({ success: true, data: 42 })
		expect(num.safeParse(43).success).toBe(false)

		const bool = v.literal(true)
		expect(bool.safeParse(true)).toEqual({ success: true, data: true })
		expect(bool.safeParse(false).success).toBe(false)
	})
})
