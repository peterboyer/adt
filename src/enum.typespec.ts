import type { Expect, Equal } from "./testing.js";
import type { Enum } from "./enum.js";

type None = Record<never, never>;
type Unit = { Unit: true };
type Data = { Data: { value: unknown } };
type Both = Unit & Data;
type Generic<T> = { Generic: { value: T } };

type ENone = Enum<None>;
type EUnit = Enum<Unit>;
type EData = Enum<Data>;
type EBoth = Enum<Both>;
type EGeneric<T> = Enum<Generic<T>>;

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

	Expect<Equal<Enum.Root<ENone>, never>>,
	Expect<Equal<Enum.Root<EUnit>, { Unit: true }>>,
	Expect<Equal<Enum.Root<EData>, { Data: { value: unknown } }>>,
	Expect<Equal<Enum.Root<EBoth>, { Unit: true; Data: { value: unknown } }>>,
	Expect<Equal<Enum.Root<EGeneric<number>>, { Generic: { value: number } }>>,
	Expect<Equal<
		Enum.Root<
			Enum<{ Partial: { req: boolean, opt?: never } }>
		>,
		{ Partial: { req: boolean, opt?: never } }
	>>,

	Expect<Equal<Enum.Keys<ENone>, never>>,
	Expect<Equal<Enum.Keys<EUnit>, "Unit">>,
	Expect<Equal<Enum.Keys<EData>, "Data">>,
	Expect<Equal<Enum.Keys<EBoth>, "Unit" | "Data">>,
	Expect<Equal<Enum.Keys<EGeneric<number>>, "Generic">>,

	Expect<Equal<Enum.Pick<ENone, never>, never>>,
	Expect<Equal<Enum.Pick<EUnit, never>, never>>,
	Expect<Equal<Enum.Pick<EUnit, "Unit">, EUnit>>,
	Expect<Equal<Enum.Pick<EData, never>, never>>,
	Expect<Equal<Enum.Pick<EData, "Data">, EData>>,
	Expect<Equal<Enum.Pick<EBoth, never>, never>>,
	Expect<Equal<Enum.Pick<EBoth, "Unit">, EUnit>>,
	Expect<Equal<Enum.Pick<EBoth, "Data">, EData>>,
	Expect<Equal<Enum.Pick<EBoth, "Unit" | "Data">, EBoth>>,
	Expect<Equal<Enum.Pick<EGeneric<number>, never>, never>>,
	Expect<Equal<Enum.Pick<EGeneric<number>, "Generic">, EGeneric<number>>>,
	Expect<Equal<Enum.Pick<Enum<{ A: true, B: true }, "custom">, "A", "custom">, Enum<{ A: true }, "custom">>>,

	Expect<Equal<Enum.Omit<ENone, never>, never>>,
	Expect<Equal<Enum.Omit<EUnit, never>, EUnit>>,
	Expect<Equal<Enum.Omit<EUnit, "Unit">, never>>,
	Expect<Equal<Enum.Omit<EData, never>, EData>>,
	Expect<Equal<Enum.Omit<EData, "Data">, never>>,
	Expect<Equal<Enum.Omit<EBoth, never>, EBoth>>,
	Expect<Equal<Enum.Omit<EBoth, "Unit">, EData>>,
	Expect<Equal<Enum.Omit<EBoth, "Data">, EUnit>>,
	Expect<Equal<Enum.Omit<EBoth, "Unit" | "Data">, never>>,
	Expect<Equal<Enum.Omit<EGeneric<number>, never>, EGeneric<number>>>,
	Expect<Equal<Enum.Omit<EGeneric<number>, "Generic">, never>>,

	Expect<Equal<Enum.Extend<ENone, never>, ENone>>,
	Expect<Equal<Enum.Extend<ENone, { A: true }>, Enum<{ A: true }>>>,
	Expect<Equal<Enum.Extend<EUnit, never>, EUnit>>,
	Expect<Equal<Enum.Extend<EUnit, { A: true }>, Enum<{ Unit: true; A: true }>>>,
	Expect<Equal<Enum.Extend<EData, never>, EData>>,
	Expect<Equal<Enum.Extend<EData, { A: true }>, Enum<{ Data: { value: unknown }; A: true }>>>,
	Expect<Equal<Enum.Extend<EBoth, never>, EBoth>>,
	Expect<Equal<Enum.Extend<EBoth, { Unit: { value: unknown } }>, Enum<{ Unit: { value: unknown }; Data: { value: unknown } }>>>,
	Expect<Equal<Enum.Extend<EGeneric<number>, never>, EGeneric<number>>>,
	Expect<Equal<Enum.Extend<EGeneric<number>, { Generic: { foo: null } }>, Enum<{ Generic: { value: number; foo: null } }>>>,

	Expect<Equal<
			Enum.Merge<
				| Enum<{ A: true; B: true; C: { c1: string } }>
				| Enum<{ B: { b1: string }; C: { c2: number }; D: true }>
			>,
			Enum<
				{ A: true; B: { b1: string }; C: { c1: string; c2: number }; D: true }
			>
		>
	>
];

({}) as [
	Expect<Equal<Enum.Loading, { _type: "Loading" }>>,
	Expect<
		Equal<
			Enum.Loading | Enum.Ok<string>,
			{ _type: "Loading" } | { _type: "Ok"; value: string }
		>
	>,
];

{
	type State = Enum.Extend<
		Enum<{ Left: { value: string }; Right: { value: string } }>,
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
