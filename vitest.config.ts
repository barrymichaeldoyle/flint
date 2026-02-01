import { readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: readdirSync(path.join(import.meta.dirname, "packages")).map(
			(name) => ({
				ssr: {
					resolve: { conditions: ["@flint.fyi/source"] },
				},
				test: {
					clearMocks: true,
					include: ["**/src/**/*.test.ts", "**/tests/**/*.test.ts"],
					name,
					root: path.join(import.meta.dirname, "packages", name),
					setupFiles: [
						"console-fail-test/setup",
						"@flint.fyi/ts-patch/install-patch-hooks",
						// knip:ignore-start
						...(name === "e2e" ? ["./vitest.setup.ts"] : []),
						// knip:ignore-end
					],
					testTimeout: 10_000,
					typecheck: {
						enabled: true,
					},
				},
			}),
		),
	},
});
