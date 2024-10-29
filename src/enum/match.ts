import type { Enum } from "../enum.js";

export function Match<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	function match<
		TEnum extends Enum.Any<TDiscriminant>,
		TKey extends Enum.Keys<TEnum, TDiscriminant>,
	>(
		value: TEnum,
		matcher: TKey | TKey[],
	): value is Enum.Pick<TEnum, TKey, TDiscriminant>;
	function match<
		TEnum extends Enum.Any<TDiscriminant>,
		TEnumMatcher extends EnumMatcher<TEnum, TDiscriminant>,
		TMatcher extends [TFallback] extends [never]
			? TEnumMatcher
			: Partial<TEnumMatcher>,
		TFallback = never,
	>(
		value: TEnum,
		matcher: TMatcher & { _?: TFallback },
	): ReturnTypeMatcher<TMatcher> | ReturnTypeFallback<TFallback>;
	function match(value: any, matcher: any) {
		const key = value[discriminant];
		if (typeof matcher === "string") {
			return key === matcher;
		}

		if (Array.isArray(matcher)) {
			return matcher.includes(key);
		}

		const keyMatch = matcher[key] ?? matcher["_"];
		if (!keyMatch) {
			throw TypeError(`unhandled enum variant: ${JSON.stringify(value)}`);
		}
		if (typeof keyMatch === "function") {
			return keyMatch(value as any) as any;
		}
		return keyMatch as any;
	}

	return match;
}

type EnumMatcher<
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

type ReturnTypeMatcher<TMatcher extends Record<string, unknown>> =
	undefined extends TMatcher[Exclude<keyof TMatcher, "_">]
		? never
		: {
				[Key in keyof TMatcher]: TMatcher[Key] extends (...args: any[]) => any
					? ReturnType<TMatcher[Key]>
					: TMatcher[Key];
			}[keyof TMatcher];

type ReturnTypeFallback<TFallback> = TFallback extends (...args: any[]) => any
	? ReturnType<TFallback>
	: TFallback;
