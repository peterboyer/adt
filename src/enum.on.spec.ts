import type { Expect, Equal } from "./testing.js";
import { Enum } from "./enum.js";

describe("Enum.on", () => {
	test("Enum.on().define", () => {
		type Foo = Enum.define<typeof Foo>;
		const Foo = Enum.on("kind").define(
			{} as {
				A: true;
				B: { data: string };
			},
		);

		expect(Foo.A()).toStrictEqual({ kind: "A" });
		expect(Foo.B({ data: "..." })).toStrictEqual({ kind: "B", data: "..." });

		!0 as Expect<Equal<Foo, { kind: "A" } | { kind: "B"; data: string }>>;
	});

	test("Enum.on().define with mapper", () => {
		type Foo = Enum.define<typeof Foo>;
		const Foo = Enum.on("kind").define(
			{} as {
				A: true;
				B: { data: string };
			},
			{
				B: (data: string) => ({ data }),
			},
		);

		expect(Foo.A()).toStrictEqual({ kind: "A" });
		expect(Foo.B("...")).toStrictEqual({ kind: "B", data: "..." });

		!0 as Expect<Equal<Foo, { kind: "A" } | { kind: "B"; data: string }>>;
	});

	test("Enum.on().match", () => {
		type Foo = Enum.define<typeof Foo>;
		const Foo = Enum.on("kind").define(
			{} as {
				A: true;
				B: { data: string };
			},
		);

		expect(Enum.on("kind").match(Foo.A() as Foo, "A")).toBe(true);
		expect(Enum.on("kind").match(Foo.B({ data: "..." }) as Foo, "A")).toBe(
			false,
		);
	});

	test("Enum.on().switch", () => {
		type Foo = Enum.define<typeof Foo>;
		const Foo = Enum.on("kind").define(
			{} as {
				A: true;
				B: { data: string };
				C: true;
			},
		);

		function fn(value: Foo) {
			return Enum.on("kind").switch(value, {
				A: () => "a",
				B: ({ data }) => data,
				_: () => "_",
			});
		}

		expect(fn(Foo.A())).toEqual("a");
		expect(fn(Foo.B({ data: "..." }))).toEqual("...");
		expect(fn(Foo.C())).toEqual("_");
	});
});
