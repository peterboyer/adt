import type { Enum } from "../enum.js";
import type { Identity } from "../shared/identity.js";
import type { Intersect } from "../shared/intersect.js";

export function Define<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	const constants: Record<string, Enum.Any> = {};
	const defaultProxy = new Proxy({} as any, {
		get:
			(_, key: string) =>
			(...args: any[]) => {
				if (!args.length) {
					return (
						constants[key] ??
						(constants[key] = { [discriminant]: key } as Enum.Any)
					);
				}
				return { [discriminant]: key, ...args[0] };
			},
	});

	return function <
		TVariants extends Enum.Variants,
		TMapper extends Mapper<TEnum, TDiscriminant>,
		TEnum extends Enum<TVariants, TDiscriminant>,
	>(
		_variants: TVariants,
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
		if (!mapper) {
			return defaultProxy;
		}
		return new Proxy({} as any, {
			get: (_, key: string) => {
				type LooseMapper = Partial<Record<string, (...args: any[]) => any>>;
				const dataFn = (mapper as unknown as LooseMapper | undefined)?.[key];
				return (...args: any[]) => {
					if (!args.length) {
						return (
							constants[key] ??
							(constants[key] = { [discriminant]: key } as Enum.Any)
						);
					}
					const data = dataFn ? dataFn(...args) : args[0];
					return { [discriminant]: key, ...data };
				};
			},
		});
	};
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
