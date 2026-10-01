import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('NumberSchema', () => {
	it('validates numbers successfully', () => {
		const schema = v.number()
		expect(schema.safeParse(42)).toEqual({ success: true, data: 42 })
		expect(schema.safeParse(-3.14)).toEqual({ success: true, data: -3.14 })
		expect(schema.safeParse(0)).toEqual({ success: true, data: 0 })
	})

	it('rejects non-numbers and NaN', () => {
		const schema = v.number()
		expect(schema.safeParse('42').success).toBe(false)
		expect(schema.safeParse(NaN).success).toBe(false)
		expect(schema.safeParse(null).success).toBe(false)
		expect(schema.safeParse(undefined).success).toBe(false)
	})

	it('validates min and max constraints', () => {
		const schema = v.number().min(5).max(10)
		expect(schema.safeParse(5).success).toBe(true)
		expect(schema.safeParse(10).success).toBe(true)
		expect(schema.safeParse(4).success).toBe(false)
		expect(schema.safeParse(11).success).toBe(false)
	})

	it('validates integers', () => {
		const schema = v.number().int()
		expect(schema.safeParse(10).success).toBe(true)
		expect(schema.safeParse(10.5).success).toBe(false)
	})

	it('validates positive and non-negative', () => {
		const pos = v.number().positive()
		expect(pos.safeParse(1).success).toBe(true)
		expect(pos.safeParse(0).success).toBe(false)
		expect(pos.safeParse(-1).success).toBe(false)

		const nonNeg = v.number().nonnegative()
		expect(nonNeg.safeParse(1).success).toBe(true)
		expect(nonNeg.safeParse(0).success).toBe(true)
		expect(nonNeg.safeParse(-1).success).toBe(false)
	})

	it('validates negative and non-positive', () => {
		const neg = v.number().negative()
		expect(neg.safeParse(-1).success).toBe(true)
		expect(neg.safeParse(0).success).toBe(false)
		expect(neg.safeParse(1).success).toBe(false)

		const nonPos = v.number().nonpositive()
		expect(nonPos.safeParse(-1).success).toBe(true)
		expect(nonPos.safeParse(0).success).toBe(true)
		expect(nonPos.safeParse(1).success).toBe(false)
	})

	it('validates finite and multipleOf', () => {
		const finite = v.number().finite()
		expect(finite.safeParse(100).success).toBe(true)
		expect(finite.safeParse(Infinity).success).toBe(false)
		expect(finite.safeParse(-Infinity).success).toBe(false)

		const mult = v.number().multipleOf(5)
		expect(mult.safeParse(15).success).toBe(true)
		expect(mult.safeParse(14).success).toBe(false)
	})
})
