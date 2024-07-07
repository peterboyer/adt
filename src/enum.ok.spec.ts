import { Enum } from "./enum.js";

test("Ok with no arg", () => {
	expect(Enum.Ok()).toStrictEqual({
		_type: "Ok",
		value: undefined,
	});
});

test("Ok with an arg", () => {
	expect(Enum.Ok("...")).toStrictEqual({
		_type: "Ok",
		value: "...",
	});
});
