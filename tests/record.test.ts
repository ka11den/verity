import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('RecordSchema', () => {
	it('validates record with default string keys', () => {
		const schema = v.record(v.number())

		expect(schema.safeParse({ a: 1, b: 2 })).toEqual({
			success: true,
			data: { a: 1, b: 2 },
		})
		expect(schema.safeParse({ a: 'not a number' }).success).toBe(false)
	})

	it('validates record with custom key schema', () => {
		const schema = v.record(v.number(), v.string().startsWith('num_'))

		expect(schema.safeParse({ num_1: 10 })).toEqual({
			success: true,
			data: { num_1: 10 },
		})
		expect(schema.safeParse({ other_1: 10 }).success).toBe(false)
	})
})
