import type { Enum } from "./enum.js";

export function Error<T = never, X = never>(
	...args: [T] extends [never]
		? [error?: X, cause?: unknown]
		: T extends { _type: "Error"; error: unknown }
			? [error: T["error"], cause?: unknown]
			: T extends { _type: "Error"; error?: undefined }
				? [error?: undefined, cause?: unknown]
				: never
): [T] extends [never]
	? Enum.Error<X>
	: [T] extends [{ _type: "Error" }]
		? T
		: never {
	return { _type: "Error", error: args[0], cause: args[1] } as any;
}
