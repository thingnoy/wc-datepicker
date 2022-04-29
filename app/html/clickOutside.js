// eslint-disable-next-line jsdoc/require-returns
/**
 * Click Outside
 * @param {Node} node
 * @param _options
 */
export default (node, _options = {}) => {
	// const options = { include: [], ..._options };

	function detect(event) {
		const isTarget = event.composedPath().includes(node);
		if (!isTarget) {
			// if (!node.contains(target) || options.include.some((i) => target.isSameNode(i))) {
			node.dispatchEvent(new CustomEvent("clickOutside"));
		}
	}
	document.addEventListener("click", detect, { passive: true, capture: true });
	return {
		destroy() {
			document.removeEventListener("click", detect);
		},
	};
};
