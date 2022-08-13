import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue(), eslint()],
	base: "./",
	resolve:{
		alias:{
			"@" : path.resolve(__dirname, "./src")
		},
	},
})
