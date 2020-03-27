import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

const config = {
	input: "src/index.js",
	external: [
		"react",
		"prop-types",
		"@vkontakte/icons",
		"@vkontakte/vk-bridge",
		"@vkontakte/vkui"
	],
	output: {
		format: "umd",
		name: "app",
		globals: {
			"react": "React",
			"react-dom": "ReactDOM",
			"prop-types": "PropTypes",
			"@vkontakte/vk-bridge": "VKBridge",
			"@vkontakte/vkui": "vkui"
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