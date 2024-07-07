import type { Enum } from "./enum.js";

export function Value<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	type ToArgs<TEnum extends Enum.Any<TDiscriminant>> = Enum.Root<
		TEnum,
		TDiscriminant
	> extends infer Root
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
		TData extends
			| Enum.Variants.UnitValueAny
			| Enum.Variants.DataValueAny = true,
	>(
		...args: [T] extends [never]
			? [name: TName, data?: TData]
			: T extends Enum.Any<TDiscriminant>
				? ToArgs<T>
				: never
	): [T] extends [never] ? Enum<{ [Key in TName]: TData }> : T {
		return { [discriminant]: args[0], ...(args[1] as any) } as any;
	};
}
