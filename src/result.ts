import type { Enum } from "./enum.js";
import { Ok } from "./result/ok.js";
import { Error } from "./result/error.js";
import { From } from "./result/from.js";

export const Result = {
	Ok,
	Error,
	from: From,
};

export type Result<TOk = undefined, TError = unknown> =
	| Result.Ok<TOk>
	| Result.Error<TError>;

export namespace Result {
	export type Ok<TOk = undefined> = Enum<{
		Ok: [TOk] extends [undefined] ? { value?: undefined } : { value: TOk };
	}>;

	export type Error<TError = unknown> = Enum<{
		Error: ([TError] extends [undefined]
			? { error?: undefined }
			: { error: TError }) & { cause?: unknown };
	}>;
}
