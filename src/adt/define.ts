import type { ADT } from "../adt.js";
import type { Identity } from "../shared/identity.js";
import type { Intersect } from "../shared/intersect.js";
import type { RequiredKeys } from "./define/required-keys.js";

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
	): ADT.Root<TEnum, TDiscriminant> extends infer Root
		? {
				[Key in keyof Root]: ADT.Pick<
					TEnum,
					Extract<ADT.Keys<TEnum, TDiscriminant>, Key>,
					TDiscriminant
				> extends infer Result
					? Key extends keyof TMapper
						? TMapper[Key] extends (...args: any[]) => any
							? (...args: Parameters<TMapper[Key]>) => Result
							: EnumVariantConstructor<Root[Key], Result>
						: EnumVariantConstructor<Root[Key], Result>
					: never;
			}
		: never {
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

type EnumVariantConstructor<TVariant, TResult> = (
	...args: TVariant extends true
		? []
		: [RequiredKeys<TVariant>] extends [never]
			? [data?: TVariant]
			: [data: TVariant]
) => TResult;
