import type { Enum } from "../enum.js";
import { Define } from "./define.js";
import { Match } from "./match.js";
import { Value } from "./value.js";
import { Unwrap } from "./unwrap.js";

export function On<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
): {
	define: ReturnType<typeof Define<TDiscriminant>>;
	match: ReturnType<typeof Match<TDiscriminant>>;
	value: ReturnType<typeof Value<TDiscriminant>>;
	unwrap: ReturnType<typeof Unwrap<TDiscriminant>>;
} {
	return (On.cache[discriminant] = (On.cache[discriminant] as any) ?? {
		define: Define(discriminant),
		match: Match(discriminant),
		value: Value(discriminant),
		unwrap: Unwrap(discriminant),
	});
}

On.cache = {} as Record<string, ReturnType<typeof On>>;
