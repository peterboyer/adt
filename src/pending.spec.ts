import { Pending } from "./pending.js";

test("Pending", () => {
	expect(Pending()).toStrictEqual({ _type: "Loading" });
});
