import type { Enum } from "./enum.js";

export function From<TDiscriminant extends Enum.Discriminant.Any>(
	_discriminant: TDiscriminant,
) {
	type ToArgs<TEnum extends Enum.Any<TDiscriminant>> = Enum.Root<
		TEnum,
		TDiscriminant
	> extends infer Root
		? {
				[Key in keyof Root]: Root[Key] extends true
					? [name: Key]
					: [name: Key, data: Root[Key]];
			}[keyof Root]
		: never;

	return function <T = never, X = never>(
		...args: [T] extends [never]
			? [value?: X]
			: T extends Enum.Any<TDiscriminant>
				? ToArgs<T>
				: T extends { _type: "Value"; value?: undefined }
					? [value?: undefined]
					: never
	): [T] extends [never]
		? Enum.Value<X>
		: [T] extends [{ _type: "Value" }]
			? T
			: never {
		return { _type: "Value", value: args[0] } as any;
	};
}
