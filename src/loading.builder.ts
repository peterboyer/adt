import type { Loading } from "./loading.js";

export const _Loading = (): Loading => ({ _type: "Loading" });

_Loading.Ready = function Ready<T = never, X = never>(
	...args: [T] extends [never]
		? [value?: X]
		: T extends { _type: "Ready"; value: unknown }
			? [value: T["value"]]
			: T extends { _type: "Ready"; value?: undefined }
				? [value?: undefined]
				: never
): [T] extends [never]
	? Loading.Ready<X>
	: [T] extends [{ _type: "Ready" }]
		? T
		: never {
	return { _type: "Ready", value: args[0] } as any;
};
