import type { Enum } from "../enum.js";
import type { Identity } from "../shared/identity.js";
import type { Intersect } from "../shared/intersect.js";

export function Unwrap<TDiscriminant extends Enum.Discriminant.Any>(
	discriminant: TDiscriminant,
) {
	return function <
		TEnum extends Enum.Any<TDiscriminant>,
		TPath extends keyof TPaths,
		TPaths extends Identity<
			Intersect<
				Enum.Root<TEnum, TDiscriminant> extends infer Root
					? {
							[Key in keyof Root]: Root[Key] extends true
								? never
								: {
										[Prop in keyof Root[Key]]-?: {
											[Path in `${Key & string}.${Prop &
												string}`]: Root[Key][Prop];
										};
									}[keyof Root[Key]];
						}[keyof Root]
					: never
			>
		>,
	>(value: TEnum, path: TPath): TPaths[TPath] | undefined {
		const [variantName, variantDataProperty] = (path as string).split(".") as [
			string,
			string,
		];
		return (
			value[discriminant] === variantName
				? value[variantDataProperty as keyof typeof value]
				: undefined
		) as any;
	};
}
