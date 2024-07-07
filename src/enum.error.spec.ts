import { Enum } from "./enum.js";

describe("Enum.Error", () => {
	test("Error with no arg", () => {
		expect(Enum.Error()).toStrictEqual({
			_type: "Error",
			error: undefined,
			cause: undefined,
		});
	});

	test("Error with an arg", () => {
		expect(Enum.Error("...")).toStrictEqual({
			_type: "Error",
			error: "...",
			cause: undefined,
		});
	});

	test("Error with an arg and cause", () => {
		const InvalidInputError = Enum.Error("InvalidInput");
		expect(Enum.Error("...", InvalidInputError)).toStrictEqual({
			_type: "Error",
			error: "...",
			cause: InvalidInputError,
		});
	});
});
