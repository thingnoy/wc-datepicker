/**
 * Node Module
 * =====================
 *
 * Show hello world text
 *
 * @contributors: Thingnoy <boyskypart@gmail.com> (https://github.com/thingnoy)
 *
 * @license: MIT License
 *
 */
import type { ModuleInterface, ModuleResponseInterface } from "@app/types/webcomponent.interfaces";

/**
 * Hello World
 * =====================
 *
 * Print hello-world
 *
 * @interface [ModuleInterface ModuleResponseInterface](https://github.com/thingnoy/wc-datepicker/blob/main/app/webcomponent/types/module.interfaces.ts)
 *
 * @param {string} {text} - input string
 *
 * @return {Promise<ModuleResponseInterface>} (async) app() function that return string
 *
 */
const webcomponent = async ({ text }: ModuleInterface): Promise<ModuleResponseInterface> => {
	const app = () => text;

	return {
		app,
	};
};

export default webcomponent;
