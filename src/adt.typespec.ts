import type { ADT } from "./adt.js";

import type { Expect, Equal } from "pb.expectequal";

type None = Record<never, never>;
type Unit = { Unit: true };
type Data = { Data: { value: unknown } };
type Both = Unit & Data;
type Generic<T> = { Generic: { value: T } };

type ENone = ADT<None>;
type EUnit = ADT<Unit>;
type EData = ADT<Data>;
type EBoth = ADT<Both>;
type EGeneric<T> = ADT<Generic<T>>;

// prettier-ignore
({}) as [
	Expect<Equal<ENone, never>>,
	Expect<Equal<ENone["_type"], never>>,
	Expect<Equal<EUnit, { _type: "Unit" }>>,
	Expect<Equal<EUnit["_type"], "Unit">>,
	Expect<Equal<EData, { _type: "Data"; value: unknown }>>,
	Expect<Equal<EData["_type"], "Data">>,
	Expect<Equal<EBoth, { _type: "Unit" } | { _type: "Data"; value: unknown }>>,
	Expect<Equal<EBoth["_type"], "Unit" | "Data">>,
	Expect<Equal<EGeneric<number>, { _type: "Generic"; value: number }>>,
	Expect<Equal<EGeneric<number>["_type"], "Generic">>,

	Expect<Equal<ADT.Root<ENone>, never>>,
	Expect<Equal<ADT.Root<EUnit>, { Unit: true }>>,
	Expect<Equal<ADT.Root<EData>, { Data: { value: unknown } }>>,
	Expect<Equal<ADT.Root<EBoth>, { Unit: true; Data: { value: unknown } }>>,
	Expect<Equal<ADT.Root<EGeneric<number>>, { Generic: { value: number } }>>,
	Expect<Equal<
		ADT.Root<
			ADT<{ Partial: { req: boolean, opt?: never } }>
		>,
		{ Partial: { req: boolean, opt?: never } }
	>>,

	Expect<Equal<ADT.Keys<ENone>, never>>,
	Expect<Equal<ADT.Keys<EUnit>, "Unit">>,
	Expect<Equal<ADT.Keys<EData>, "Data">>,
	Expect<Equal<ADT.Keys<EBoth>, "Unit" | "Data">>,
	Expect<Equal<ADT.Keys<EGeneric<number>>, "Generic">>,

	Expect<Equal<ADT.Pick<ENone, never>, never>>,
	Expect<Equal<ADT.Pick<EUnit, never>, never>>,
	Expect<Equal<ADT.Pick<EUnit, "Unit">, EUnit>>,
	Expect<Equal<ADT.Pick<EData, never>, never>>,
	Expect<Equal<ADT.Pick<EData, "Data">, EData>>,
	Expect<Equal<ADT.Pick<EBoth, never>, never>>,
	Expect<Equal<ADT.Pick<EBoth, "Unit">, EUnit>>,
	Expect<Equal<ADT.Pick<EBoth, "Data">, EData>>,
	Expect<Equal<ADT.Pick<EBoth, "Unit" | "Data">, EBoth>>,
	Expect<Equal<ADT.Pick<EGeneric<number>, never>, never>>,
	Expect<Equal<ADT.Pick<EGeneric<number>, "Generic">, EGeneric<number>>>,
	Expect<Equal<ADT.Pick<ADT<{ A: true, B: true }, "custom">, "A", "custom">, ADT<{ A: true }, "custom">>>,

	Expect<Equal<ADT.Omit<ENone, never>, never>>,
	Expect<Equal<ADT.Omit<EUnit, never>, EUnit>>,
	Expect<Equal<ADT.Omit<EUnit, "Unit">, never>>,
	Expect<Equal<ADT.Omit<EData, never>, EData>>,
	Expect<Equal<ADT.Omit<EData, "Data">, never>>,
	Expect<Equal<ADT.Omit<EBoth, never>, EBoth>>,
	Expect<Equal<ADT.Omit<EBoth, "Unit">, EData>>,
	Expect<Equal<ADT.Omit<EBoth, "Data">, EUnit>>,
	Expect<Equal<ADT.Omit<EBoth, "Unit" | "Data">, never>>,
	Expect<Equal<ADT.Omit<EGeneric<number>, never>, EGeneric<number>>>,
	Expect<Equal<ADT.Omit<EGeneric<number>, "Generic">, never>>,

	Expect<Equal<ADT.Extend<ENone, never>, ENone>>,
	Expect<Equal<ADT.Extend<ENone, { A: true }>, ADT<{ A: true }>>>,
	Expect<Equal<ADT.Extend<EUnit, never>, EUnit>>,
	Expect<Equal<ADT.Extend<EUnit, { A: true }>, ADT<{ Unit: true; A: true }>>>,
	Expect<Equal<ADT.Extend<EData, never>, EData>>,
	Expect<Equal<ADT.Extend<EData, { A: true }>, ADT<{ Data: { value: unknown }; A: true }>>>,
	Expect<Equal<ADT.Extend<EBoth, never>, EBoth>>,
	Expect<Equal<ADT.Extend<EBoth, { Unit: { value: unknown } }>, ADT<{ Unit: { value: unknown }; Data: { value: unknown } }>>>,
	Expect<Equal<ADT.Extend<EGeneric<number>, never>, EGeneric<number>>>,
	Expect<Equal<ADT.Extend<EGeneric<number>, { Generic: { foo: null } }>, ADT<{ Generic: { value: number; foo: null } }>>>,

	Expect<Equal<
			ADT.Merge<
				| ADT<{ A: true; B: true; C: { c1: string } }>
				| ADT<{ B: { b1: string }; C: { c2: number }; D: true }>
			>,
			ADT<
				{ A: true; B: { b1: string }; C: { c1: string; c2: number }; D: true }
			>
		>
	>
];

{
	type State = ADT.Extend<
		ADT<{ Left: { value: string }; Right: { value: string } }>,
		{ None: true }
	>;

	const getState = (): State => {
		if ("".toString()) return { _type: "Left", value: "" };
		if ("".toString()) return { _type: "Right", value: "" };
		return { _type: "None" };
	};

	() => {
		const $state = getState();

		if ($state._type === "Left") {
			({}) as [Expect<Equal<typeof $state, { _type: "Left"; value: string }>>];
			return;
		}
		if ($state._type === "Right") {
			({}) as [Expect<Equal<typeof $state, { _type: "Right"; value: string }>>];
			return;
		}
		if ($state._type === "None") {
			({}) as [Expect<Equal<typeof $state, { _type: "None" }>>];
			return;
		}

		({}) as [Expect<Equal<typeof $state, never>>];
	};
}
