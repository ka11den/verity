import { createSafeError, type SafeParseResult } from '../core/base'
import { BooleanSchema } from './boolean'
import { DateSchema } from './date'
import { NumberSchema } from './number'
import { StringSchema } from './string'

export class CoerceStringSchema extends StringSchema {
	public override safeParse(input: unknown): SafeParseResult<string> {
		if (input === null || input === undefined) {
			return createSafeError(`Expected coercible string, received ${String(input)}`)
		}
		return super.safeParse(String(input))
	}

	public override async safeParseAsync(input: unknown): Promise<SafeParseResult<string>> {
		if (input === null || input === undefined) {
			return createSafeError(`Expected coercible string, received ${String(input)}`)
		}
		return super.safeParseAsync(String(input))
	}
}

export class CoerceNumberSchema extends NumberSchema {
	public override safeParse(input: unknown): SafeParseResult<number> {
		if (input === null || input === undefined || typeof input === 'symbol') {
			return createSafeError(`Expected coercible number, received ${typeof input}`)
		}
		const num = Number(input)
		return super.safeParse(num)
	}

	public override async safeParseAsync(input: unknown): Promise<SafeParseResult<number>> {
		if (input === null || input === undefined || typeof input === 'symbol') {
			return createSafeError(`Expected coercible number, received ${typeof input}`)
		}
		const num = Number(input)
		return super.safeParseAsync(num)
	}
}

export class CoerceBooleanSchema extends BooleanSchema {
	public override safeParse(input: unknown): SafeParseResult<boolean> {
		return super.safeParse(Boolean(input))
	}

	public override async safeParseAsync(input: unknown): Promise<SafeParseResult<boolean>> {
		return super.safeParseAsync(Boolean(input))
	}
}

export class CoerceDateSchema extends DateSchema {
	public override safeParse(input: unknown): SafeParseResult<Date> {
		if (input === null || input === undefined) {
			return createSafeError(`Expected coercible date, received ${String(input)}`)
		}
		const date = new Date(input as any)
		return super.safeParse(date)
	}

	public override async safeParseAsync(input: unknown): Promise<SafeParseResult<Date>> {
		if (input === null || input === undefined) {
			return createSafeError(`Expected coercible date, received ${String(input)}`)
		}
		const date = new Date(input as any)
		return super.safeParseAsync(date)
	}
}
