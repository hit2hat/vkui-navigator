import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

const config = {
	input: "src/index.js",
	external: [
		"react"
	],
	output: {
		format: "umd",
		name: "app",
		globals: {
			react: "React",
		}
	},
	plugins: [
		babel({
			exclude: "node_modules/**"
		}),
		resolve(),
		commonjs(),
		terser()
	]
};

export default config;