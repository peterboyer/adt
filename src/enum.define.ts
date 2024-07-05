import type { Enum } from "./enum.js";
import type { Identity } from "./shared/identity.js";
import type { Intersect } from "./shared/intersect.js";

export function Define<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	return function <
		TEnum extends Enum.Any<TDiscriminant>,
		TMapper extends Mapper<TEnum, TDiscriminant>,
	>(_enum: TEnum, mapper?: TMapper) {
		return Builder({} as TEnum, discriminant, mapper);
	};
}

function Builder<
	TEnum extends Enum.Any<TDiscriminant>,
	TMapper extends Mapper<TEnum, TDiscriminant>,
	TDiscriminant extends keyof TEnum & string,
>(
	_value: TEnum,
	discriminant: TDiscriminant,
	mapper?: TMapper,
): Identity<
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
> {
	return new Proxy({} as any, {
		get: (_, key: string) => {
			type LooseMapper = Partial<Record<string, (...args: any[]) => any>>;
			const dataFn = (mapper as unknown as LooseMapper | undefined)?.[key];
			return (...args: any[]) => {
				const data = dataFn ? dataFn(...args) : args[0];
				return { [discriminant]: key, ...data };
			};
		},
	});
}

type Mapper<
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
