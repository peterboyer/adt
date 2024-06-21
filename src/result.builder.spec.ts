import { branch } from "./testing.js";
import { Result } from "./result.js";

describe("Result", () => {
	test("Ok", () => {
		expect(Result.Ok()).toStrictEqual({
			_type: "Ok",
			value: undefined,
		});
		expect(Result.Ok("...")).toStrictEqual({
			_type: "Ok",
			value: "...",
		});
	});

	test("Error", () => {
		expect(Result.Error()).toStrictEqual({
			_type: "Error",
			error: undefined,
		});
		expect(Result.Error("...")).toStrictEqual({
			_type: "Error",
			error: "...",
		});
	});

	void function getFoo(): Result<string, "ParseError"> {
		if (branch()) {
			// @ts-expect-error Expecting an arg.
			return Result.Error();
		}
		if (branch()) {
			// @ts-expect-error "1" is not assignable to "ParseError".
			return Result.Error("1");
		}
		if (branch()) {
			// @ts-expect-error Expecting an arg.
			return Result.Ok();
		}
		if (branch()) {
			// @ts-expect-error 1 is not assignable to `string`.
			return Result.Ok(1);
		}
		if (branch()) {
			return Result.Error("ParseError");
		}
		return Result.Ok("1");
	};

	void async function getFooAsync(): Promise<Result<string, "ParseError">> {
		if (branch()) {
			// @ts-expect-error Expecting an arg.
			return Result.Error();
		}
		if (branch()) {
			// @ts-expect-error "1" is not assignable to "ParseError".
			return Result.Error("1");
		}
		if (branch()) {
			// @ts-expect-error Expecting an arg.
			return Result.Ok();
		}
		if (branch()) {
			// @ts-expect-error 1 is not assignable to `string`.
			return Result.Ok(1);
		}
		if (branch()) {
			return Result.Error("ParseError");
		}
		return Result.Ok("...");
	};

	void function getResult(): Result {
		if (branch()) {
			return Result.Error();
		}
		if (branch()) {
			return Result.Error(undefined);
		}
		if (branch()) {
			return Result.Error(undefined, {});
		}
		if (branch()) {
			return Result.Ok(undefined);
		}
		return Result.Ok();
	};

	void function getAnything(): string {
		if (branch()) {
			// @ts-expect-error Not assignable to return type.
			return Result.Ok();
		}
		if (branch()) {
			// @ts-expect-error Not assignable to return type.
			return Result.Ok("...");
		}
		if (branch()) {
			// @ts-expect-error Not assignable to return type.
			return Result.Error();
		}
		if (branch()) {
			// @ts-expect-error Not assignable to return type.
			return Result.Error("...");
		}
		return "...";
	};
});
