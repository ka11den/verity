import { describe, expect, it } from 'vitest'
import { v } from '../src'

describe('ArraySchema', () => {
	it('validates primitive arrays', () => {
		const schema = v.array(v.string())
		expect(schema.safeParse(['a', 'b', 'c'])).toEqual({
			success: true,
			data: ['a', 'b', 'c'],
		})
	})

	it('rejects non-arrays', () => {
		const schema = v.array(v.number())
		expect(schema.safeParse('not an array').success).toBe(false)
		expect(schema.safeParse(null).success).toBe(false)
		expect(schema.safeParse({}).success).toBe(false)
	})

	it('validates min, max, length, and nonempty', () => {
		const minMax = v.array(v.number()).min(2).max(4)
		expect(minMax.safeParse([1]).success).toBe(false)
		expect(minMax.safeParse([1, 2]).success).toBe(true)
		expect(minMax.safeParse([1, 2, 3, 4]).success).toBe(true)
		expect(minMax.safeParse([1, 2, 3, 4, 5]).success).toBe(false)

		const exact = v.array(v.string()).length(2)
		expect(exact.safeParse(['a', 'b']).success).toBe(true)
		expect(exact.safeParse(['a']).success).toBe(false)

		const nonempty = v.array(v.number()).nonempty()
		expect(nonempty.safeParse([]).success).toBe(false)
		expect(nonempty.safeParse([1]).success).toBe(true)
	})

	it('tracks element indices in error paths', () => {
		const schema = v.array(v.object({ age: v.number().min(18) }))
		const result = schema.safeParse([{ age: 20 }, { age: 15 }])

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.errors[0]).toBe('[1].age: Number must be greater than or equal to 18')
			expect(result.issues[0]).toEqual({
				path: [1, 'age'],
				message: 'Number must be greater than or equal to 18',
			})
		}
	})
})
