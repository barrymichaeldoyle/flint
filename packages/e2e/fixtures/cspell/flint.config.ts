import { spelling } from "@flint.fyi/spelling";
import { defineConfig, globs } from "flint";

export default defineConfig({
	use: [
		{
			files: globs.all,
			rules: spelling.presets.logical,
		},
	],
});
