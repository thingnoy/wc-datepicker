/**
 * Jest Tests
 * =====================
 *
 * @contributors: Thingnoy <boyskypart@gmail.com> (https://github.com/thingnoy)
 *
 * @license: MIT License
 *
 */
import m from "@app/functions/webcomponent";

test("show hello world", async () => {
	const { app } = await m({ text: "hello-world" });
	expect(app()).toBe("hello-world");
});
