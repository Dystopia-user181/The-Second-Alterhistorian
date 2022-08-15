import path from "path";

import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue({
		reactivityTransform: true
	}), eslint()],
	base: "./",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		},
	},
});