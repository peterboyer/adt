import type { Enum } from "./enum.js";
import { Define } from "./enum.define.js";
import { Match } from "./enum.match.js";
import { Switch } from "./enum.switch.js";
import { Value } from "./enum.value.js";
import { Unwrap } from "./enum.unwrap.js";

export function On<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
): {
	define: ReturnType<typeof Define<TDiscriminant>>;
	match: ReturnType<typeof Match<TDiscriminant>>;
	switch: ReturnType<typeof Switch<TDiscriminant>>;
	value: ReturnType<typeof Value<TDiscriminant>>;
	unwrap: ReturnType<typeof Unwrap<TDiscriminant>>;
} {
	return (On.cache[discriminant] = (On.cache[discriminant] as any) ?? {
		define: Define(discriminant),
		match: Match(discriminant),
		switch: Switch(discriminant),
		value: Value(discriminant),
		unwrap: Unwrap(discriminant),
	});
}

On.cache = {} as Record<string, ReturnType<typeof On>>;
