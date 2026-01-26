import { spelling } from "@flint.fyi/spelling";
import { defineConfig } from "flint";

export default defineConfig({
	use: [
		{
			files: "fixtures/**/*.md",
			rules: spelling.presets.logical,
		},
	],
});
