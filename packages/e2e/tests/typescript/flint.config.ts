import { defineConfig } from "flint";
import { ts } from "@flint.fyi/ts";

export default defineConfig({
	use: [
		{
			files: "fixtures/**/*.ts",
			rules: ts.presets.logical,
		},
	],
});
