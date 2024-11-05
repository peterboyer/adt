import type { Identity } from "./shared/identity.js";
import type { Intersect } from "./shared/intersect.js";
import { On } from "./adt/on.js";
import { Define } from "./adt/define.js";
import { Match } from "./adt/match.js";
import { Switch } from "./adt/switch.js";
import { Value } from "./adt/value.js";
import { Unwrap } from "./adt/unwrap.js";

export const DiscriminantDefault: ADT.Discriminant.Default = "_type";

export const ADT = {
	on: On,
	define: Define(DiscriminantDefault),
	match: Match(DiscriminantDefault),
	switch: Switch(DiscriminantDefault),
	value: Value(DiscriminantDefault),
	unwrap: Unwrap(DiscriminantDefault),
};

export type ADT<
	TVariants extends ADT.Variants,
	TDiscriminant extends ADT.Discriminant = ADT.Discriminant.Default,
> = {
	[TKey in keyof TVariants]-?: TVariants[TKey] extends ADT.Variants.UnitValueAny
		? ADT.Variants.Unit<TKey & string, TDiscriminant>
		: TVariants[TKey] extends ADT.Variants.DataValueAny
			? ADT.Variants.Data<TKey & string, TVariants[TKey], TDiscriminant>
			: never;
}[keyof TVariants];

export namespace ADT {
	export type define<
		TBuilder extends Record<string, (...args: any[]) => unknown>,
	> = {
		[Key in keyof TBuilder]: ReturnType<TBuilder[Key]>;
	}[keyof TBuilder];

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
	> = Merge<TEnum | ADT<TVariants, TDiscriminant>, TDiscriminant>;

	export type Merge<
		TEnums extends Any<TDiscriminant>,
		TDiscriminant extends Discriminant = Discriminant.Default,
	> = ADT<
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
