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
