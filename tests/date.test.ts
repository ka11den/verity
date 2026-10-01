import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('DateSchema', () => {
	it('validates valid Date instances', () => {
		const schema = v.date()
		const now = new Date()

		expect(schema.safeParse(now)).toEqual({ success: true, data: now })
		expect(schema.safeParse(new Date('invalid')).success).toBe(false)
		expect(schema.safeParse('2026-01-01').success).toBe(false)
	})

	it('validates min and max date', () => {
		const min = new Date('2026-01-01')
		const max = new Date('2026-12-31')
		const schema = v.date().min(min).max(max)

		expect(schema.safeParse(new Date('2026-06-01')).success).toBe(true)
		expect(schema.safeParse(new Date('2025-12-31')).success).toBe(false)
		expect(schema.safeParse(new Date('2027-01-01')).success).toBe(false)
	})
})
