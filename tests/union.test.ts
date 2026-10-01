import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('UnionSchema', () => {
	it('validates values matching any schema in union', () => {
		const schema = v.union([v.string(), v.number()])

		expect(schema.safeParse('hello')).toEqual({ success: true, data: 'hello' })
		expect(schema.safeParse(123)).toEqual({ success: true, data: 123 })
		expect(schema.safeParse(true).success).toBe(false)
	})
})
