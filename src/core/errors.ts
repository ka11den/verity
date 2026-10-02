import type { SafeParseError, ValidationIssue } from './types.js'
import { formatPath } from './utils.js'

export function createSafeError(
	message: string,
	path: ReadonlyArray<string | number> = [],
): SafeParseError {
	const normalizedPath = path as (string | number)[]
	const formatted =
		normalizedPath.length > 0 ? `${formatPath(normalizedPath)}: ${message}` : message

	return {
		success: false,
		errors: [formatted],
		issues: [
			{
				path: normalizedPath,
				message,
			},
		],
	}
}

export function createSafeErrors(issues: ValidationIssue[]): SafeParseError {
	const errors = issues.map((issue) =>
		issue.path.length > 0 ? `${formatPath(issue.path)}: ${issue.message}` : issue.message,
	)
	return {
		success: false,
		errors,
		issues,
	}
}

export class VerityError extends Error {
	public readonly errors: string[]
	public readonly issues: ValidationIssue[]

	constructor(issues: ValidationIssue[] | string[]) {
		const normalizedIssues: ValidationIssue[] =
			issues.length > 0 && typeof issues[0] === 'string'
				? (issues as string[]).map((message) => ({ path: [], message }))
				: (issues as ValidationIssue[])

		const errorStrings = normalizedIssues.map((issue) =>
			issue.path.length > 0 ? `${formatPath(issue.path)}: ${issue.message}` : issue.message,
		)

		super(errorStrings.join(', '))
		this.name = 'VerityError'
		this.issues = normalizedIssues
		this.errors = errorStrings

		Object.setPrototypeOf(this, VerityError.prototype)
	}

	public flatten(): {
		formErrors: string[]
		fieldErrors: Record<string, string[]>
	} {
		const formErrors: string[] = []
		const fieldErrors: Record<string, string[]> = {}

		for (const issue of this.issues) {
			if (issue.path.length === 0) {
				formErrors.push(issue.message)
			} else {
				const key = formatPath(issue.path)

				if (!fieldErrors[key]) fieldErrors[key] = []

				fieldErrors[key].push(issue.message)
			}
		}

		return {
			formErrors,
			fieldErrors,
		}
	}
}
