import type { Enum } from "./enum.js";

export function Match<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	return function <
		TEnum extends Enum.Any<TDiscriminant>,
		TKey extends Enum.Keys<TEnum, TDiscriminant>,
	>(
		value: TEnum,
		matcher: TKey | TKey[],
	): value is Enum.Pick<TEnum, TKey, TDiscriminant> {
		const key = value[discriminant];
		if (Array.isArray(matcher)) {
			return matcher.includes(key as TKey);
		}
		return key === matcher;
	};
}
