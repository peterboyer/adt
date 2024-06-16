import type { Identity } from "./shared/identity.js";
import type { Intersect } from "./shared/intersect.js";
import { Engine } from "./enum.builder.js";
export { Enum_match, Enum_switch } from "./enum.builder.js";

export type Enum<
	TVariants extends Enum.Variants,
	TDiscriminant extends Enum.Discriminant = Enum.Discriminant.Default,
> = {
	[TKey in keyof TVariants]-?: TVariants[TKey] extends Enum.Variants.UnitValueAny
		? Enum.Variants.Unit<TKey & string, TDiscriminant>
		: TVariants[TKey] extends Enum.Variants.DataValueAny
			? Enum.Variants.Data<TKey & string, TVariants[TKey], TDiscriminant>
			: never;
}[keyof TVariants];

export const Enum = Engine;

export namespace Enum {
	export type Any<TDiscriminant extends Discriminant = Discriminant.Default> =
		Record<TDiscriminant, string>;

	export type Discriminant = string;

	export namespace Discriminant {
		export type Any = string;

		export type Default = "_type";
	}

	export type Variants = Record<
		Variants.KeyAny,
		Variants.UnitValueAny | Variants.DataValueAny
	>;

	export namespace Variants {
		export type KeyAny = string;

		export type UnitValueAny = true;

		export type DataValueAny = Record<string, unknown>;

		export type Unit<
			TKey extends KeyAny,
			TDiscriminant extends Discriminant,
		> = Identity<{ [TDiscriminantKey in TDiscriminant]: TKey }>;

		export type Data<
			TKey extends KeyAny,
			TData extends DataValueAny,
			TDiscriminant extends Discriminant,
		> = Identity<{ [TDiscriminantKey in TDiscriminant]: TKey } & TData>;
	}

	export type Root<
		TEnum extends Any<TDiscriminant>,
		TDiscriminant extends Discriminant = Discriminant.Default,
	> = Identity<
		Intersect<
			TEnum extends unknown
				? {
						[Key in TEnum[TDiscriminant]]: [
							Exclude<keyof TEnum, TDiscriminant>,
						] extends [never]
							? true
							: {
									[Key in keyof TEnum as Key extends TDiscriminant
										? never
										: Key]: TEnum[Key];
								};
					}
				: never
		>
	>;

	export type Keys<
		TEnum extends Any<TDiscriminant>,
		TDiscriminant extends Discriminant = Discriminant.Default,
	> = TEnum[TDiscriminant];

	export type Pick<
		TEnum extends Any<TDiscriminant>,
		TKeys extends Keys<TEnum, TDiscriminant>,
		TDiscriminant extends Discriminant = Discriminant.Default,
	> = Extract<TEnum, Record<TDiscriminant, TKeys>>;

	export type Omit<
		TEnum extends Any<TDiscriminant>,
		TKeys extends Keys<TEnum, TDiscriminant>,
		TDiscriminant extends Discriminant = Discriminant.Default,
	> = Exclude<TEnum, Record<TDiscriminant, TKeys>>;

	export type Extend<
		TEnum extends Any<TDiscriminant>,
		TVariants extends Variants,
		TDiscriminant extends Discriminant = Discriminant.Default,
	> = Merge<TEnum | Enum<TVariants, TDiscriminant>, TDiscriminant>;

	export type Merge<
		TEnums extends Any<TDiscriminant>,
		TDiscriminant extends Discriminant = Discriminant.Default,
	> = Enum<
		TrueOrObj<
			Intersect<
				TrueAsEmpty<
					TEnums extends unknown ? Root<TEnums, TDiscriminant> : never
				>
			>
		>,
		TDiscriminant
	>;

	type TrueOrObj<T> = {
		[K in keyof T]: keyof T[K] extends never ? true : Identity<T[K]>;
	};

	type TrueAsEmpty<T> = {
		[K in keyof T]: T[K] extends true ? Record<never, never> : T[K];
	};
}
