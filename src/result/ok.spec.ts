import { Ok } from "./ok.js";

test("Ok with no arg", () => {
	expect(Ok()).toStrictEqual({
		_type: "Ok",
		value: undefined,
	});
});

test("Ok with an arg", () => {
	expect(Ok("...")).toStrictEqual({
		_type: "Ok",
		value: "...",
	});
});
