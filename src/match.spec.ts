import type { Expect, Equal } from "./shared/tests";
import type { Enum } from "./enum";
import { match } from "./match";

describe("match", () => {
	describe("default discriminant", () => {
		test("value with one variant", () => {
			type Value = Enum<{ One: true }>;

			// @ts-expect-error Is missing the `One` or `_` matcher case.
			void (() => match({} as Value)({}));

			// @ts-expect-error Is missing the `One` matcher case.
			void (() => match({} as Value)({ _: undefined }));

			// all cases
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => "One" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
			}

			// only fallback
			{
				const fn = (value: Value) =>
					match(value, {
						_: () => "Fallback" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
			}

			// all cases and forbid fallback
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => "One" as const,
						_: undefined,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
			}
		});

		test("value with many variants", () => {
			type Value = Enum<{ One: true; Two: { value: string } }>;

			// @ts-expect-error Is missing the `One` or `_` matcher case.
			void (() => match({} as Value)({}));

			// @ts-expect-error Is missing the `One` matcher case.
			void (() => match({} as Value)({ _: undefined }));
			//
			// @ts-expect-error Is missing the `Two` matcher case.
			void (() => match({} as Value)({ One: () => true }));

			// all cases
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => "One" as const,
						Two: () => "Two" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
			}

			// only fallback
			{
				const fn = (value: Value) =>
					match(value, {
						_: () => "Fallback" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
			}

			// one case and fallback
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => "One" as const,
						_: () => "Fallback" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Fallback">>;
			}

			// all cases and forbid fallback
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => "One" as const,
						Two: () => "Two" as const,
						_: undefined,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
			}

			// all cases, some using value properties
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => 0,
						Two: ({ value }) => value,
						_: () => "Unknown",
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, number | string>>;
			}
		});

		test("runtime", () => {
			type Value = Enum<{ One: true; Two: { value: string } }>;

			// all cases
			{
				const fn = (value: Value) =>
					match(value, {
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
					match(value, {
						_: () => "Unknown",
					});

				expect(fn({ _type: "One" })).toEqual("Unknown");
				expect(fn({ _type: "Two", value: "Two" })).toEqual("Unknown");
				expect(fn({} as Value)).toEqual("Unknown");
			}

			{
				const fn = (value: Value) =>
					match(value, {
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
			type Value = Enum<{ One: true }, "custom">;

			// @ts-expect-error Is missing the `One` or `_` matcher case.
			void (() => match({} as Value)({}));

			// @ts-expect-error Is missing the `One` matcher case.
			void (() => match({} as Value)({ _: undefined }));

			// all cases
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => "One" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
			}

			// only fallback
			{
				const fn = (value: Value) =>
					match(value, {
						_: () => "Fallback" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
			}

			// all cases and forbid fallback
			{
				const fn = (value: Value) =>
					match(value, {
						One: () => "One" as const,
						_: undefined,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
			}
		});

		test("value with many variants", () => {
			type Value = Enum<{ One: true; Two: { value: string } }, "custom">;

			// @ts-expect-error Is missing the `One` or `_` matcher case.
			void (() => match([{} as Value, "custom"])({}));

			// @ts-expect-error Is missing the `One` matcher case.
			void (() => match([{} as Value, "custom"])({ _: undefined }));
			//
			// @ts-expect-error Is missing the `Two` matcher case.
			void (() => match([{} as Value, "custom"])({ One: () => true }));

			// all cases
			{
				const fn = (value: Value) =>
					match([value, "custom"], {
						One: () => "One" as const,
						Two: () => "Two" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
			}

			// only fallback
			{
				const fn = (value: Value) =>
					match([value, "custom"], {
						_: () => "Fallback" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
			}

			// one case and fallback
			{
				const fn = (value: Value) =>
					match([value, "custom"], {
						One: () => "One" as const,
						_: () => "Fallback" as const,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Fallback">>;
			}

			// all cases and forbid fallback
			{
				const fn = (value: Value) =>
					match(value, "custom", {
						One: () => "One" as const,
						Two: () => "Two" as const,
						_: undefined,
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
			}

			// all cases, some using value properties
			{
				const fn = (value: Value) =>
					match(value, "custom", {
						One: () => 0,
						Two: ({ value }) => value,
						_: () => "Unknown",
					});
				!0 as Expect<Equal<ReturnType<typeof fn>, number | string>>;
			}
		});

		test("runtime", () => {
			type Value = Enum<{ One: true; Two: { value: string } }, "custom">;

			// all cases
			{
				const fn = (value: Value) =>
					match(value, "custom", {
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
					match([value, "custom"], {
						_: () => "Unknown",
					});

				expect(fn({ custom: "One" })).toEqual("Unknown");
				expect(fn({ custom: "Two", value: "Two" })).toEqual("Unknown");
				expect(fn({} as Value)).toEqual("Unknown");
			}

			{
				const fn = (value: Value) =>
					match(value, "custom", {
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
});
