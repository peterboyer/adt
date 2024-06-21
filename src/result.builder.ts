import type { Result } from "./result.js";

export function Ok<T = never, X = never>(
	...args: [T] extends [never]
		? [value?: X]
		: T extends { _type: "Ok"; value: unknown }
			? [value: T["value"]]
			: T extends { _type: "Ok"; value?: undefined }
				? [value?: undefined]
				: never
): [T] extends [never]
	? Result.Ok<X>
	: [T] extends [{ _type: "Ok" }]
		? T
		: never {
	return { _type: "Ok", value: args[0] } as any;
}

export function Error<T = never, X = never>(
	...args: [T] extends [never]
		? [error?: X, cause?: unknown]
		: T extends { _type: "Error"; error: unknown }
			? [error: T["error"], cause?: unknown]
			: T extends { _type: "Error"; error?: undefined }
				? [error?: undefined, cause?: unknown]
				: never
): [T] extends [never]
	? Result.Error<X>
	: [T] extends [{ _type: "Error" }]
		? T
		: never {
	return { _type: "Error", error: args[0], cause: args[1] } as any;
}
