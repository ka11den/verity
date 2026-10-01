import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('StringSchema', () => {
	it('validates basic strings', () => {
		const schema = v.string()
		expect(schema.safeParse('hello')).toEqual({ success: true, data: 'hello' })
		expect(schema.safeParse(123).success).toBe(false)
	})

	it('validates min, max, and length', () => {
		const schema = v.string().min(2).max(5)
		expect(schema.safeParse('ab').success).toBe(true)
		expect(schema.safeParse('abcde').success).toBe(true)
		expect(schema.safeParse('a').success).toBe(false)
		expect(schema.safeParse('abcdef').success).toBe(false)

		const exact = v.string().length(4)
		expect(exact.safeParse('abcd').success).toBe(true)
		expect(exact.safeParse('abc').success).toBe(false)
	})

	it('supports trim modifier', () => {
		const schema = v.string().trim().min(3)
		const res = schema.safeParse('   hello   ')
		expect(res).toEqual({ success: true, data: 'hello' })
		expect(schema.safeParse('  hi  ').success).toBe(false)
	})

	it('validates regex', () => {
		const schema = v.string().regex(/^[0-9]+$/)
		expect(schema.safeParse('12345').success).toBe(true)
		expect(schema.safeParse('123a45').success).toBe(false)
	})

	it('validates url', () => {
		const schema = v.string().url()
		expect(schema.safeParse('https://example.com/api').success).toBe(true)
		expect(schema.safeParse('http://localhost:3000').success).toBe(true)
		expect(schema.safeParse('not-a-url').success).toBe(false)
		expect(schema.safeParse('ftp://example.com').success).toBe(false)
	})

	it('validates uuid', () => {
		const schema = v.string().uuid()
		expect(schema.safeParse('123e4567-e89b-12d3-a456-426614174000').success).toBe(true)
		expect(schema.safeParse('not-a-uuid').success).toBe(false)
	})

	it('validates startsWith, endsWith, and includes', () => {
		const schema = v.string().startsWith('pre_').endsWith('_post').includes('middle')
		expect(schema.safeParse('pre_middle_post').success).toBe(true)
		expect(schema.safeParse('other_middle_post').success).toBe(false)
		expect(schema.safeParse('pre_middle_other').success).toBe(false)
		expect(schema.safeParse('pre_other_post').success).toBe(false)
	})
})
