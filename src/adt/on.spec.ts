import { On } from "./on.js";

import type { Expect, Equal } from "pb.expectequal";
import type { ADT } from "../adt.js";

test("On.define", () => {
	const Foo = On("kind").define(
		{} as {
			A: true;
			B: { data: string };
		},
	);
	type Foo = ADT.define<typeof Foo>;

	expect(Foo.A()).toStrictEqual({ kind: "A" });
	expect(Foo.B({ data: "..." })).toStrictEqual({ kind: "B", data: "..." });

	!0 as Expect<Equal<Foo, { kind: "A" } | { kind: "B"; data: string }>>;
});

test("On.define with mapper", () => {
	const Foo = On("kind").define(
		{} as {
			A: true;
			B: { data: string };
		},
		{
			B: (data: string) => ({ data }),
		},
	);
	type Foo = ADT.define<typeof Foo>;

	expect(Foo.A()).toStrictEqual({ kind: "A" });
	expect(Foo.B("...")).toStrictEqual({ kind: "B", data: "..." });

	!0 as Expect<Equal<Foo, { kind: "A" } | { kind: "B"; data: string }>>;
});

test("On.match", () => {
	const Foo = On("kind").define(
		{} as {
			A: true;
			B: { data: string };
		},
	);
	type Foo = ADT.define<typeof Foo>;

	expect(On("kind").match(Foo.A() as Foo, "A")).toBe(true);
	expect(On("kind").match(Foo.B({ data: "..." }) as Foo, "A")).toBe(false);
});

test("On.switch", () => {
	const Foo = On("kind").define(
		{} as {
			A: true;
			B: { data: string };
			C: true;
		},
	);
	type Foo = ADT.define<typeof Foo>;

	function fn(value: Foo) {
		return On("kind").switch(value, {
			A: () => "a",
			B: ({ data }) => data,
			_: () => "_",
		});
	}

	expect(fn(Foo.A())).toEqual("a");
	expect(fn(Foo.B({ data: "..." }))).toEqual("...");
	expect(fn(Foo.C())).toEqual("_");
});
