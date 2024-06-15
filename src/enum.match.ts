import type { Enum } from "./enum.js";
import { is_ } from "./enum.is.js";

export function match<
	TEnum extends Enum.Any,
	TEnumMatcher extends EnumMatcher<TEnum>,
	TMatcher extends [TFallback] extends [never]
		? TEnumMatcher
		: Partial<TEnumMatcher>,
	TFallback = never,
>(
	value: TEnum,
	matcher: TMatcher & { _?: TFallback },
): ReturnTypeMatcher<TMatcher> | ReturnTypeFallback<TFallback>;
export function match<
	TEnum extends Enum.Any<TDiscriminant>,
	TEnumMatcher extends EnumMatcher<TEnum, TDiscriminant>,
	TMatcher extends [TFallback] extends [never]
		? TEnumMatcher
		: Partial<TEnumMatcher>,
	TFallback = never,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		Enum.Discriminant.Default,
>(
	value: TEnum,
	matcher: TMatcher & { _?: TFallback },
	discriminant: TDiscriminant,
): ReturnTypeMatcher<TMatcher> | ReturnTypeFallback<TFallback>;
export function match<
	TEnum extends Enum.Any<TDiscriminant>,
	TKey extends Enum.Keys<TEnum, TDiscriminant>,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		Enum.Discriminant.Default,
>(
	value: TEnum,
	matcher: TKey | TKey[],
	discriminant?: TDiscriminant,
): value is Enum.Pick<TEnum, TKey, TDiscriminant>;
export function match(value: unknown, matcher: unknown) {
	if (typeof value === "string") {
		return is_(value as any, "_type", matcher);
	}
	return match_(value as any, "_type", matcher as any);
}

export function match_<
	TEnum extends Enum.Any<TDiscriminant>,
	TEnumMatcher extends EnumMatcher<TEnum, TDiscriminant>,
	TMatcher extends [TFallback] extends [never]
		? TEnumMatcher
		: Partial<TEnumMatcher>,
	TFallback = never,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		Enum.Discriminant.Default,
>(
	value: TEnum,
	discriminant: TDiscriminant,
	matcher: TMatcher & { _?: TFallback },
): ReturnTypeMatcher<TMatcher> | ReturnTypeFallback<TFallback> {
	const key = value[discriminant];
	const keyMatch =
		matcher[key as unknown as keyof TMatcher & string] ??
		matcher["_" as keyof TMatcher & string];
	if (!keyMatch) {
		throw TypeError(`unhandled enum variant: ${JSON.stringify(value)}`);
	}
	if (typeof keyMatch === "function") {
		return keyMatch(value as any) as any;
	}
	return keyMatch as any;
}

export type EnumMatcher<
	TEnum extends Enum.Any<TDiscriminant>,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		Enum.Discriminant.Default,
> =
	| {
			[Key in keyof Enum.Root<TEnum, TDiscriminant>]: Enum.Root<
				TEnum,
				TDiscriminant
			>[Key] extends true
				? () => unknown
				: (value: Enum.Root<TEnum, TDiscriminant>[Key]) => unknown;
	  }
	| {
			[Key in keyof Enum.Root<TEnum, TDiscriminant>]: unknown;
	  };

export type ReturnTypeMatcher<TMatcher extends Record<string, unknown>> =
	undefined extends TMatcher[Exclude<keyof TMatcher, "_">]
		? never
		: {
				[Key in keyof TMatcher]: TMatcher[Key] extends (...args: any[]) => any
					? ReturnType<TMatcher[Key]>
					: TMatcher[Key];
			}[keyof TMatcher];

export type ReturnTypeFallback<TFallback> = TFallback extends (
	...args: any[]
) => any
	? ReturnType<TFallback>
	: TFallback;
