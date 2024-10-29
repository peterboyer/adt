import { Error } from "./error.js";

test("Error with no arg", () => {
	expect(Error()).toStrictEqual({
		_type: "Error",
		error: undefined,
		cause: undefined,
	});
});

test("Error with an arg", () => {
	expect(Error("...")).toStrictEqual({
		_type: "Error",
		error: "...",
		cause: undefined,
	});
});

test("Error with an arg and cause", () => {
	const InvalidInputError = Error("InvalidInput");
	expect(Error("...", InvalidInputError)).toStrictEqual({
		_type: "Error",
		error: "...",
		cause: InvalidInputError,
	});
});
