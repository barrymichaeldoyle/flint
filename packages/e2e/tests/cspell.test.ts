import { execa } from "execa";
import { describe, expect, it } from "vitest";

describe("cspell", () => {
	// TODO: Assert that there's a typo when running flint on typo.md

	it("should find a typo", async () => {
		const { stdout } = await execa({
			cwd: "./packages/e2e/fixtures/cspell",
		})`pnpm flint`;
		expect({ stdout }).toMatchSnapshot();
		expect({ stdout }).toMatchInlineSnapshot();
	});

	// // TODO: Assert that there's no typo when running flint on no_typo.md
	// it("should not find a typo", () => {
	// 	const result = runFlint("no_typo.md");
	// 	expect(result).not.toContain("typo");
	// });
});
