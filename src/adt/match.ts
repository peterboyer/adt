import type { ADT } from "../adt.js";

export function Match<TDiscriminant extends ADT.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	return function <
		TEnum extends ADT.Any<TDiscriminant>,
		TKey extends ADT.Keys<TEnum, TDiscriminant>,
	>(
		value: TEnum,
		matcher: TKey | TKey[],
	): value is ADT.Pick<TEnum, TKey, TDiscriminant> {
		const key = value[discriminant];
		if (Array.isArray(matcher)) {
			return matcher.includes(key as TKey);
		}
		return key === matcher;
	};
}
