/**
 * Node Module (Library) Boilerplate
 * =====================
 *
 * Create your node module (library) with this user friendly boilerplate. Use this respository as template for your new node library/module
 *
 * @contributors: Thingnoy <boyskypart@gmail.com> (https://github.com/thingnoy)
 *
 * @license: MIT License
 *
 */

/**
 * ModuleInterface
 * =====================
 *
 */
export interface ModuleInterface {
	/**
	 * Input text
	 * =====================
	 * Set text
	 *
	 * @interface [ModuleInterface](https://github.com/thingnoy/wc-datepicker/blob/main/app/webcomponent/types/module.interfaces.ts)
	 *
	 * @param {string} text - input text
	 *
	 */
	text: string;
}

/**
 * ModuleResponseInterface
 * =====================
 *
 */
export interface ModuleResponseInterface {
	/**
	 * Output text
	 * =====================
	 * Get text
	 *
	 * @interface [ModuleResponseInterface](https://github.com/thingnoy/wc-datepicker/blob/main/app/webcomponent/types/module.interfaces.ts)
	 *
	 * @return {fn} string - run app() for output text
	 *
	 */
	app(): string;
}
