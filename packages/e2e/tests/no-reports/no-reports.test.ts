import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { runFlint } from "../utils.ts";

const cwd = path.dirname(fileURLToPath(import.meta.url));

describe("no-reports", () => {
	it("should report a happy message when no lint issues are found", async () => {
		const { exitCode, stdout } = await runFlint(cwd);

		expect(exitCode).toBe(0);
		expect(stdout).toMatchInlineSnapshot(`
			"<dim>Linting with <cyan><bold>flint.config.ts</bold></fg><dim>...</fg>
			<green>No linting issues found.</fg>
			<green></fg>"
		`);
	});
});
