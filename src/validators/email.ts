import type { Validator } from '../core/types'

export const EMAIL_REGEX =
	/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i

export function isEmail(val: string): boolean {
	return EMAIL_REGEX.test(val)
}

export function emailValidator(message?: string): Validator<string> {
	return (value: string) => {
		if (!isEmail(value)) {
			return message ?? 'Invalid email address'
		}
		return null
	}
}
