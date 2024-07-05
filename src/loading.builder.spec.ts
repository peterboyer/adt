import { Loading } from "./loading.js";

describe("Loading", () => {
	test("Loading", () => {
		expect(Loading()).toStrictEqual({ _type: "Loading" });
	});
});
