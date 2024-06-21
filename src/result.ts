import { Enum } from "./enum.js";

export type Result<TValue = undefined, TError = undefined> =
	| Result.Ok<TValue>
	| Result.Error<TError>;

import { Ok, Error } from "./result.builder.js";
import { from } from "./result.from.js";

export const Result = {
	Ok,
	Error,
	from,
	unwrap: <TResult extends Result<unknown, unknown>>(
		result: TResult,
	): TResult extends { _type: "Ok" } ? TResult["value"] : undefined => {
		return (result._type === "Ok" ? result.value : undefined) as any;
	},
	unwrapError: <TResult extends Result<unknown, unknown>>(
		result: TResult,
	): TResult extends { _type: "Error" } ? TResult["error"] : undefined => {
		return (result._type === "Error" ? result.error : undefined) as any;
	},
};

export namespace Result {
	export type Ok<TValue = undefined> = Enum<{
		Ok: [TValue] extends [undefined]
			? { value?: undefined }
			: { value: TValue };
	}>;

	export type Error<TError = undefined> = Enum<{
		Error: [TError] extends [undefined]
			? { error?: undefined; cause?: unknown }
			: { error: TError; cause?: unknown };
	}>;
}
