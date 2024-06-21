import { branch, type Equal, type Expect } from "./testing.js";
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
			cause: undefined,
		});
		expect(Result.Error("...")).toStrictEqual({
			_type: "Error",
			error: "...",
			cause: undefined,
		});
	});

	test("unwrap", () => {
		{
			const $result = Result.Ok("foo");
			expect(Result.unwrap($result)).toEqual("foo");
			expect(Result.unwrapError($result)).toBeUndefined();
		}
		{
			const $result = Result.Error("foo");
			expect(Result.unwrap($result)).toBeUndefined();
			expect(Result.unwrapError($result)).toEqual("foo");
		}

		{
			const $result = {} as Result<string | undefined, "FooError">;
			const value = Result.unwrap($result);
			!0 as Expect<Equal<typeof value, string | undefined>>;
		}

		{
			const $result = {} as Result.Ok<string>;
			const value = Result.unwrap($result);
			!0 as Expect<Equal<typeof value, string>>;
		}

		{
			const $result = {} as Result<string, "FooError">;
			const error = Result.unwrapError($result);
			!0 as Expect<Equal<typeof error, "FooError" | undefined>>;
		}

		{
			const $result = {} as Result.Error<"FooError">;
			const error = Result.unwrapError($result);
			!0 as Expect<Equal<typeof error, "FooError">>;
		}
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
