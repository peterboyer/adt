import type { Result } from "../result.js";

export function From<TReturnType>(
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
	? Result // when never
	: 0 extends 1 & TReturnType
		? Result<unknown, unknown> // when any
		: [TReturnType] extends [Promise<unknown>]
			? Promise<Result<Awaited<TReturnType>, unknown>> // when promise
			: Result<TReturnType, unknown>;
