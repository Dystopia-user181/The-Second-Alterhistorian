import { resolve } from "path";

import { defineConfig } from "vite";

import checker from "vite-plugin-checker";
import eslint from "vite-plugin-eslint";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			reactivityTransform: true
		}),
		eslint(),
		checker({ typescript: true })
	],
	base: "./",
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src")
		},
	},
});