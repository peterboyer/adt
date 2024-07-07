import { Enum } from "./enum.js";

describe("Enum.Loading", () => {
	test("Loading", () => {
		expect(Enum.Loading()).toStrictEqual({ _type: "Loading" });
	});
});
