import type { Enum } from "./enum.js";

export function Value<T = never, X = never>(
	...args: [T] extends [never]
		? [value?: X]
		: T extends { _type: "Value"; value: unknown }
			? [value: T["value"]]
			: T extends { _type: "Value"; value?: undefined }
				? [value?: undefined]
				: never
): [T] extends [never]
	? Enum.Value<X>
	: [T] extends [{ _type: "Value" }]
		? T
		: never {
	return { _type: "Value", value: args[0] } as any;
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
	? Enum.Error<X>
	: [T] extends [{ _type: "Error" }]
		? T
		: never {
	return { _type: "Error", error: args[0], cause: args[1] } as any;
}

export const Loading = (): Enum.Loading => ({ _type: "Loading" });
