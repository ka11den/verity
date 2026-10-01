import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('Coerce', () => {
	it('coerces string', () => {
		const schema = v.coerce.string().min(2)
		expect(schema.safeParse(123)).toEqual({ success: true, data: '123' })
		expect(schema.safeParse(true)).toEqual({ success: true, data: 'true' })
		expect(schema.safeParse(1).success).toBe(false) // min 2
	})

	it('coerces number', () => {
		const schema = v.coerce.number().positive()
		expect(schema.safeParse('42')).toEqual({ success: true, data: 42 })
		expect(schema.safeParse('-10').success).toBe(false)
		expect(schema.safeParse('not-a-number').success).toBe(false)
	})

	it('coerces boolean', () => {
		const schema = v.coerce.boolean()
		expect(schema.safeParse('hello')).toEqual({ success: true, data: true })
		expect(schema.safeParse('')).toEqual({ success: true, data: false })
		expect(schema.safeParse(0)).toEqual({ success: true, data: false })
		expect(schema.safeParse(1)).toEqual({ success: true, data: true })
	})

	it('coerces date', () => {
		const schema = v.coerce.date()
		const res = schema.safeParse('2026-05-15T00:00:00.000Z')
		expect(res.success).toBe(true)
		if (res.success) {
			expect(res.data.toISOString()).toBe('2026-05-15T00:00:00.000Z')
		}
		expect(schema.safeParse('invalid-date').success).toBe(false)
	})
})
