import type { Result } from "../result.js";

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