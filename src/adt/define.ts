import type { ADT } from "../adt.js";
import type { Identity } from "../shared/identity.js";
import type { Intersect } from "../shared/intersect.js";

export function Define<TDiscriminant extends ADT.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	const defaultProxy = new Proxy({} as any, {
		get: (self, key: string) => {
			if (key in self) {
				return self[key];
			}
			return (...args: any[]) => {
				return { [discriminant]: key, ...args[0] };
			};
		},
	});

	return function <
		TVariants extends ADT.Variants,
		TMapper extends Mapper<TEnum, TDiscriminant>,
		TEnum extends ADT<TVariants, TDiscriminant>,
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
			get: (self, key: string) => {
				if (key in self) {
					return self[key];
				}
				type LooseMapper = Partial<Record<string, (...args: any[]) => any>>;
				const dataFn = (mapper as unknown as LooseMapper | undefined)?.[key];
				return (...args: any[]) => {
					const data = dataFn ? dataFn(...args) : args[0];
					return { [discriminant]: key, ...data };
				};
			},
		});
	};
}

type Mapper<
	TEnum extends ADT.Any<TDiscriminant>,
	TDiscriminant extends keyof TEnum & string = keyof TEnum &
		ADT.Discriminant.Default,
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
	TEnum extends ADT.Any<TDiscriminant>,
	TDiscriminant extends ADT.Discriminant,
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
