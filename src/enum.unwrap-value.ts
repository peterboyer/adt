import type { Enum } from "./enum.js";

export function unwrapValue<TResult extends { _type: string; value?: unknown }>(
	result: TResult,
): TResult extends Enum.Ok<unknown> ? TResult["value"] : undefined {
	return (result._type === "Ok" ? result.value : undefined) as any;
}
