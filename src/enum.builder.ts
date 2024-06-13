import type { Enum } from "./enum.js";
import type { Identity } from "./shared/identity.js";
import type { Intersect } from "./shared/intersect.js";

// export function EnumEngine<TDiscriminant extends Enum.Discriminant.Any>(
//   discriminant: TDiscriminant,
// ): {
//   Enum:
// } {
//   function Enum() {}

//   return;
// }

export function builder<TVariants extends Enum.Variants>(): Builder<
	Mapper<Enum<TVariants>>,
	Enum<TVariants>,
	Enum.Discriminant.Default
> {
	return builder_({} as Enum<TVariants>, "_type");
}

export function EnumMapper<
	TEnum extends Enum.Any,
	TMapper extends Mapper<TEnum>,
>(
	_builder: Builder<Mapper<TEnum>, TEnum>,
	mapper: TMapper,
): Builder<TMapper, TEnum> {
	return builder_({} as TEnum, "_type", mapper);
}

export function EnumCustom<
	TEnum extends Enum.Any<TDiscriminant>,
	TMapper extends Mapper<TEnum>,
	TDiscriminant extends keyof TEnum & string,
>(
	builder: Builder<TMapper, TEnum>,
	discriminant: TDiscriminant,
): Builder<TMapper, TEnum, TDiscriminant> {
	return builder_({} as TEnum, discriminant);
}

export function builder_<
	TEnum extends Enum.Any<TDiscriminant>,
	TMapper extends Mapper<TEnum, TDiscriminant>,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		Enum.Discriminant.Default,
>(
	_value: TEnum,
	discriminant: TDiscriminant,
	mapper?: TMapper,
): Builder<TMapper, TEnum, TDiscriminant> {
	return new Proxy({} as any, {
		get: (_, key: string) => {
			type LooseMapper = Partial<Record<string, (...args: any[]) => any>>;
			const dataFn = (mapper as unknown as LooseMapper | undefined)?.[key];
			return (...args: any[]) => {
				const data = dataFn ? dataFn(...args) : args[0];
				return { [discriminant ?? "_type"]: key, ...data };
			};
		},
	});
}

export type Mapper<
	TEnum extends Enum.Any<TDiscriminant>,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		Enum.Discriminant.Default,
> = Partial<
	Identity<
		Intersect<
			TEnum extends unknown
				? {
						[Key in TEnum[TDiscriminant]]: (
							...args: any[]
						) => Omit<TEnum, TDiscriminant>;
					}
				: never
		>
	>
>;

export type Builder<
	TMapper,
	TEnum extends Enum.Any<TDiscriminant>,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		Enum.Discriminant.Default,
> = Identity<
	Intersect<
		TEnum extends unknown
			? {
					[Key in TEnum[TDiscriminant]]: Key extends keyof TMapper
						? TMapper[Key] extends (...args: any[]) => any
							? (...args: Parameters<TMapper[Key]>) => TEnum
							: EnumVariantConstructor<TEnum, TDiscriminant>
						: EnumVariantConstructor<TEnum, TDiscriminant>;
				}
			: never
	>
> & { $Enum: TEnum };

type EnumVariantConstructor<
	TEnum extends Enum.Any<TDiscriminant>,
	TDiscriminant extends Enum.Discriminant,
> = TEnum extends unknown
	? [Exclude<keyof TEnum, TDiscriminant>] extends [never]
		? () => TEnum
		: [keyof PickRequired<Omit<TEnum, TDiscriminant>>] extends [never]
			? (data?: Identity<Omit<TEnum, TDiscriminant>>) => TEnum
			: (data: Identity<Omit<TEnum, TDiscriminant>>) => TEnum
	: never;

type PickRequired<T> = {
	[K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};
