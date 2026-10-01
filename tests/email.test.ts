import { describe, expect, it } from 'vitest'
import { EMAIL_REGEX, isEmail, StringSchema, v } from '../src/index'

describe('Email validation', () => {
	it('should validate correct email addresses via StringSchema().email()', () => {
		const schema = new StringSchema().email()

		expect(schema.safeParse('test@example.com').success).toBe(true)
		expect(schema.safeParse('user.name+tag@sub.example.co.uk').success).toBe(true)
		expect(schema.safeParse('admin@mail.io').success).toBe(true)
	})

	it('should reject invalid email addresses', () => {
		const schema = new StringSchema().email()

		expect(schema.safeParse('not-an-email').success).toBe(false)
		expect(schema.safeParse('@domain.com').success).toBe(false)
		expect(schema.safeParse('user@').success).toBe(false)
		expect(schema.safeParse('user@.com').success).toBe(false)
		expect(schema.safeParse('user@domain..com').success).toBe(false)
		expect(schema.safeParse(123).success).toBe(false)
	})

	it('should support custom error messages', () => {
		const customMessage = 'Invalid email address format'
		const schema = new StringSchema().email(customMessage)

		const res = schema.safeParse('bad-email')
		expect(res.success).toBe(false)

		if (!res.success) expect(res.errors).toContain(customMessage)
	})

	it('should be accessible via v.string().email() and v.email()', () => {
		const schema1 = v.string().email()
		const schema2 = v.email()

		expect(schema1.safeParse('hello@world.com').success).toBe(true)
		expect(schema2.safeParse('hello@world.com').success).toBe(true)
		expect(schema2.safeParse('invalid').success).toBe(false)
	})

	it('should combine with other validators and modifiers', () => {
		const schema = v.string().email().default('default@example.com')

		expect(schema.parse(undefined)).toBe('default@example.com')
		expect(schema.safeParse('invalid').success).toBe(false)

		const optionalEmail = v.email().optional()
		expect(optionalEmail.safeParse(undefined).success).toBe(true)
		expect(optionalEmail.safeParse('user@domain.com').success).toBe(true)
	})

	it('isEmail helper and EMAIL_REGEX should correctly validate strings', () => {
		expect(isEmail('hello@domain.com')).toBe(true)
		expect(isEmail('plain')).toBe(false)
		expect(EMAIL_REGEX.test('hello@domain.com')).toBe(true)
	})
})
