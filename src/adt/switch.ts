import type { ADT } from "../adt.js";

export function Switch<TDiscriminant extends ADT.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	return function <
		TEnum extends ADT.Any<TDiscriminant>,
		TEnumMatcher extends EnumMatcher<TEnum, TDiscriminant>,
		TMatcher extends [TFallback] extends [never]
			? TEnumMatcher
			: Partial<TEnumMatcher>,
		TFallback = never,
	>(
		value: TEnum,
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
	};
}

type EnumMatcher<
	TEnum extends ADT.Any<TDiscriminant>,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		ADT.Discriminant.Default,
> =
	| {
			[Key in keyof ADT.Root<TEnum, TDiscriminant>]: ADT.Root<
				TEnum,
				TDiscriminant
			>[Key] extends true
				? () => unknown
				: (value: ADT.Root<TEnum, TDiscriminant>[Key]) => unknown;
	  }
	| {
			[Key in keyof ADT.Root<TEnum, TDiscriminant>]: unknown;
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
