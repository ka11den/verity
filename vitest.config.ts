import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Ensures modifier modules are imported (and therefore self-register
		// into BaseSchema._registry) before any test file is executed.
		// This is necessary because some test files import concrete schema types
		// (e.g. StringSchema) directly — bypassing the library's main entry
		// point — so the modifier modules would not otherwise be loaded.
		setupFiles: ['./tests/setup.ts'],
	},
})
