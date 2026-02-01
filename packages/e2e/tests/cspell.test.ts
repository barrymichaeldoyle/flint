import { execa } from "execa";
import path from "node:path";
import { describe, expect, it } from "vitest";

const e2eRoot = path.join(import.meta.dirname, "..");

function normalizeOutput(stdout: string): string {
	const normalizedRoot = e2eRoot.replaceAll("\\", "/");
	return stdout.replaceAll("\\", "/").replaceAll(normalizedRoot, "<cwd>");
}

describe("cspell", () => {
	it("should find a typo in with_typo.md", async () => {
		const { exitCode, stdout } = await execa({
			cwd: e2eRoot,
			reject: false,
		})`pnpm flint`;

		expect(exitCode).toBe(1);
		expect(normalizeOutput(stdout)).toMatchInlineSnapshot(`
			"
			> @flint.fyi/e2e@0.19.0 flint <cwd>
			> flint

			Linting with flint.config.ts...

			<cwd>/fixtures/cspell/without_typo.md
			  1:26  Forbidden or unknown word: "incorectly".  cspell

			✖ Found 1 report across 1 file.
			 ELIFECYCLE  Command failed with exit code 1."
		`);
	});
});
