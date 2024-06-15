import type { Result } from "./result.js";

export function Ok<T = Result.Ok>(...args: OkArgs<T>): OkReturnType<T> {
	return { _type: "Ok", value: args[0] } as any;
}

type OkArgs<T> = [Extract<T, { _type: "Ok" }>] extends [never]
	? []
	: Extract<T, { _type: "Ok" }> extends { value: infer U }
		? [value: U]
		: [];

type OkReturnType<T> = NeverFallback<Extract<T, { _type: "Ok" }>, Result.Ok>;

export function Error<T = Result.Error>(
	...args: ErrorArgs<T>
): ErrorReturnType<T> {
	return { _type: "Error", error: args[0], cause: args[1] } as any;
}

type ErrorArgs<T> = [Extract<T, { _type: "Error" }>] extends [never]
	? []
	: Extract<T, { _type: "Error" }> extends { error: infer U }
		? [error: U, cause?: unknown]
		: [];

type ErrorReturnType<T> = NeverFallback<
	Extract<T, { _type: "Error" }>,
	Result.Error
>;

type NeverFallback<T, TFallback> = [T] extends [never] ? TFallback : T;
