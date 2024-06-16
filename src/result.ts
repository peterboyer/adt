import type { Enum } from "./enum.js";

export type Result<TValue = never, TError = never> =
	| Result.Ok<TValue>
	| Result.Error<TError>;

import { Ok, Error } from "./result.builder.js";
import { from } from "./result.from.js";

export const Result = {
	Ok,
	Error,
	from,
};

export namespace Result {
	export type Ok<TValue = never> = Enum<{
		Ok: [TValue] extends [never | undefined]
			? { value?: never; error?: never }
			: { value: TValue; error?: never };
	}>;

	export type Error<TError = never> = Enum<{
		Error: [TError] extends [never | undefined]
			? { value?: never; error?: never }
			: { value?: never; error: TError; cause?: unknown };
	}>;
}
