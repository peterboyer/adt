import { Switch } from "./switch.js";

import type { Expect, Equal } from "pb.expectequal";
import type { ADT } from "../adt.js";

describe("default discriminant", () => {
	test("value with one variant", () => {
		type Value = ADT<{ One: true }>;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => Switch("_type")({} as Value, {}));

		// all cases
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: "One" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
		}

		// all cases as fns
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => "One" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
		}

		// only fallback
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					_: () => "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
		}
	});

	test("value with many variants", () => {
		type Value = ADT<{ One: true; Two: { value: string } }>;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => Switch("_type")({} as Value, {}));
		// @ts-expect-error Is missing the `Two` matcher case.
		void (() => Switch("_type")({} as Value, { One: () => true }));

		// all cases
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: "One" as const,
					Two: "Two" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
		}

		// all cases as fns
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => "One" as const,
					Two: () => "Two" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
		}

		// only fallback
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					_: "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
		}

		// only fn fallback
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					_: () => "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
		}

		// one case and fallback
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => "One" as const,
					_: "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Fallback">>;
		}

		// all cases and fn fallback
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => "One" as const,
					_: () => "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Fallback">>;
		}

		// all cases and undefined as fallback
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => "One" as const,
					_: undefined,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | undefined>>;
		}

		// all cases, some using value properties
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => 0,
					Two: ({ value }) => value,
					_: () => "Unknown",
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, number | string>>;
		}
	});

	test("runtime", () => {
		type Value = ADT<{ One: true; Two: { value: string } }>;

		// all cases
		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => "One" as const,
					Two: () => "Two" as const,
					_: undefined,
				});
			expect(fn({ _type: "One" })).toEqual("One");
			expect(fn({ _type: "Two", value: "..." })).toEqual("Two");
			expect(() => fn({} as Value)).toThrow();
		}

		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					_: () => "Unknown",
				});

			expect(fn({ _type: "One" })).toEqual("Unknown");
			expect(fn({ _type: "Two", value: "Two" })).toEqual("Unknown");
			expect(fn({} as Value)).toEqual("Unknown");
		}

		{
			const fn = (value: Value) =>
				Switch("_type")(value, {
					One: () => 0,
					Two: ({ value }) => value,
					_: () => "Unknown",
				});

			expect(fn({ _type: "One" })).toEqual(0);
			expect(fn({ _type: "Two", value: "..." })).toEqual("...");
			expect(fn({} as Value)).toEqual("Unknown");
		}
	});
});

describe("custom discriminant", () => {
	test("value with one variant", () => {
		type Value = ADT<{ One: true }, "custom">;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => ADT.on("custom").switch({} as Value, {}));

		// all cases
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => "One" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
		}

		// only fallback
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					_: () => "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
		}

		// all cases and forbid fallback
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => "One" as const,
					_: undefined,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | undefined>>;
		}
	});

	test("value with many variants", () => {
		type Value = ADT<{ One: true; Two: { value: string } }, "custom">;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => ADT.on("custom").switch({} as Value, {}));
		// @ts-expect-error Is missing the `Two` matcher case.
		void (() => ADT.on("custom").switch({} as Value, { One: () => true }));

		// all cases
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => "One" as const,
					Two: () => "Two" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
		}

		// only fallback
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					_: () => "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
		}

		// one case and fallback
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => "One" as const,
					_: () => "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Fallback">>;
		}

		// all cases and fallback
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => "One" as const,
					Two: () => "Two" as const,
					_: undefined,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two" | undefined>>;
		}

		// all cases, some using value properties
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => 0,
					Two: ({ value }) => value,
					_: () => "Unknown",
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, number | string>>;
		}
	});

	test("runtime", () => {
		type Value = ADT<{ One: true; Two: { value: string } }, "custom">;

		// all cases
		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => "One" as const,
					Two: () => "Two" as const,
					_: undefined,
				});
			expect(fn({ custom: "One" })).toEqual("One");
			expect(fn({ custom: "Two", value: "..." })).toEqual("Two");
			expect(() => fn({} as Value)).toThrow();
		}

		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					_: () => "Unknown",
				});

			expect(fn({ custom: "One" })).toEqual("Unknown");
			expect(fn({ custom: "Two", value: "Two" })).toEqual("Unknown");
			expect(fn({} as Value)).toEqual("Unknown");
		}

		{
			const fn = (value: Value) =>
				Switch("custom")(value, {
					One: () => 0,
					Two: ({ value }) => value,
					_: () => "Unknown",
				});

			expect(fn({ custom: "One" })).toEqual(0);
			expect(fn({ custom: "Two", value: "..." })).toEqual("...");
			expect(fn({} as Value)).toEqual("Unknown");
		}
	});
});
