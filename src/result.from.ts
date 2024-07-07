import type { Enum } from "./enum.js";

export function Result<TReturnType>(
	fn: () => TReturnType,
): FromResult<TReturnType> {
	type TryReturn = FromResult<TReturnType>;

	try {
		const value = fn();
		if (value instanceof Promise) {
			return value
				.then((value) => ({ _type: "Ok", value }))
				.catch((error) => ({ _type: "Error", error })) as TryReturn;
		}
		return { _type: "Ok", value } as unknown as TryReturn;
	} catch (error) {
		return { _type: "Error", error } as unknown as TryReturn;
	}
}

type FromResult<TReturnType> = [TReturnType] extends [never]
	? Enum.Result // when never
	: 0 extends 1 & TReturnType
		? Enum.Result<unknown, unknown> // when any
		: [TReturnType] extends [Promise<unknown>]
			? Promise<Enum.Result<Awaited<TReturnType>, unknown>> // when promise
			: Enum.Result<TReturnType, unknown>;
