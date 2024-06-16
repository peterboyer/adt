import type { Enum } from "./enum.js";

export type Async<T = never> = [T] extends [never]
	? AsyncValue<T>
	: [T] extends [Enum.Any]
		? AsyncEnum<T>
		: AsyncValue<T>;

type AsyncValue<T> = Async.Pending<T> | Async.Ready<T>;
type AsyncEnum<TEnum> = Async.Pending | TEnum;

import { Pending, Ready } from "./async.builder.js";

export const Async = {
	Pending,
	Ready,
};

export namespace Async {
	export type Pending<TValue = never> = Enum<{
		Pending: [TValue] extends [never] ? true : { value?: never };
	}>;

	export type Ready<TValue = never> = Enum<{
		Ready: [TValue] extends [never] ? true : { value: TValue };
	}>;
}
