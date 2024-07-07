import { type Expect, type Equal, branch } from "./testing.js";
import { Enum } from "./enum.js";

void function getFoo(): Enum.Result<string, "ParseError"> {
	if (branch()) {
		// @ts-expect-error Expecting an arg.
		return Enum.Error();
	}
	if (branch()) {
		// @ts-expect-error "1" is not assignable to "ParseError".
		return Enum.Error("1");
	}
	if (branch()) {
		// @ts-expect-error Expecting an arg.
		return Enum.Value();
	}
	if (branch()) {
		// @ts-expect-error 1 is not assignable to `string`.
		return Enum.Value(1);
	}
	if (branch()) {
		return Enum.Error("ParseError");
	}
	return Enum.Value("1");
};

void async function getFooPromise(): Promise<
	Enum.Result<string, "ParseError">
> {
	if (branch()) {
		// @ts-expect-error Expecting an arg.
		return Enum.Error();
	}
	if (branch()) {
		// @ts-expect-error "1" is not assignable to "ParseError".
		return Enum.Error("1");
	}
	if (branch()) {
		// @ts-expect-error Expecting an arg.
		return Enum.Value();
	}
	if (branch()) {
		// @ts-expect-error 1 is not assignable to `string`.
		return Enum.Value(1);
	}
	if (branch()) {
		return Enum.Error("ParseError");
	}
	return Enum.Value("...");
};

void function getResult(): Enum.Result {
	if (branch()) {
		return Enum.Error();
	}
	if (branch()) {
		return Enum.Error(undefined);
	}
	if (branch()) {
		return Enum.Error(undefined, {});
	}
	if (branch()) {
		return Enum.Value(undefined);
	}
	return Enum.Value();
};

void function getAnything(): string {
	if (branch()) {
		// @ts-expect-error Not assignable to return type.
		return Enum.Value();
	}
	if (branch()) {
		// @ts-expect-error Not assignable to return type.
		return Enum.Value("...");
	}
	if (branch()) {
		// @ts-expect-error Not assignable to return type.
		return Enum.Error();
	}
	if (branch()) {
		// @ts-expect-error Not assignable to return type.
		return Enum.Error("...");
	}
	return "...";
};

({}) as [
	Expect<
		Equal<
			Enum.Result,
			| { _type: "Value"; value?: undefined }
			| { _type: "Error"; error?: undefined; cause?: unknown }
		>
	>,
	Expect<
		Equal<
			Enum.Result<unknown>,
			| { _type: "Value"; value: unknown }
			| { _type: "Error"; error?: undefined; cause?: unknown }
		>
	>,
	Expect<
		Equal<
			Enum.Result<unknown, unknown>,
			| { _type: "Value"; value: unknown }
			| { _type: "Error"; error: unknown; cause?: unknown }
		>
	>,
];
