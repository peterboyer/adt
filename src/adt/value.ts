import type { ADT } from "../adt.js";

export function Value<TDiscriminant extends ADT.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	type ToArgs<TEnum extends ADT.Any<TDiscriminant>> =
		ADT.Root<TEnum, TDiscriminant> extends infer Root
			? {
					[Key in keyof Root]: Root[Key] extends true
						? [name: Key]
						: Partial<Record<string, undefined>> extends Root[Key]
							? [name: Key, data?: Root[Key]]
							: [name: Key, data: Root[Key]];
				}[keyof Root]
			: never;

	return function <
		T = never,
		TName extends string = string,
		TData extends ADT.Variants.UnitValueAny | ADT.Variants.DataValueAny = true,
	>(
		...args: [T] extends [never]
			? [name: TName, data?: TData]
			: T extends ADT.Any<TDiscriminant>
				? ToArgs<T>
				: never
	): [T] extends [never] ? ADT<{ [Key in TName]: TData }> : T {
		return { [discriminant]: args[0], ...(args[1] as any) } as any;
	};
}
