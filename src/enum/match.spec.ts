import { Match } from "./match.js";

import type { Equal, Expect } from "../shared/testing.js";
import { Enum } from "../enum.js";

const match = Match("_type");

test("match narrow", () => {
	const Event = Enum.define(
		{} as {
			Open: true;
			Data: { value: unknown };
			Close: true;
		},
	);
	type Event = Enum.define<typeof Event>;

	const event = {} as Event;

	{
		if (match(event, "Open")) {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Open">>>];
		} else if (match(event, "Data")) {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Data">>>];
		} else {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Close">>>];
		}
	}

	{
		if (match(event, ["Open", "Close"])) {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Open" | "Close">>>];
		} else {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Data">>>];
		}
	}

	{
		const event = Event.Open() as Event;
		expect(match(event, "Open")).toEqual(true);
		expect(match(event, "Data")).toEqual(false);
		expect(match(event, ["Open", "Close"])).toEqual(true);
		expect(match(event, ["Data", "Close"])).toEqual(false);
	}
});

describe("default discriminant", () => {
	test("value with one variant", () => {
		type Value = Enum<{ One: true }>;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => match({} as Value, {}));

		// all cases
		{
			const fn = (value: Value) =>
				match(value, {
					One: "One" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One">>;
		}

		// all cases as fns
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
	});

	test("value with many variants", () => {
		type Value = Enum<{ One: true; Two: { value: string } }>;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => match({} as Value, {}));
		// @ts-expect-error Is missing the `Two` matcher case.
		void (() => match({} as Value, { One: () => true }));

		// all cases
		{
			const fn = (value: Value) =>
				match(value, {
					One: "One" as const,
					Two: "Two" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two">>;
		}

		// all cases as fns
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
					_: "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "Fallback">>;
		}

		// only fn fallback
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
					_: "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Fallback">>;
		}

		// all cases and fn fallback
		{
			const fn = (value: Value) =>
				match(value, {
					One: () => "One" as const,
					_: () => "Fallback" as const,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Fallback">>;
		}

		// all cases and undefined as fallback
		{
			const fn = (value: Value) =>
				match(value, {
					One: () => "One" as const,
					_: undefined,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | undefined>>;
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
	const match = Match("custom");

	test("value with one variant", () => {
		type Value = Enum<{ One: true }, "custom">;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => Enum.on("custom").match({} as Value, {}));

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
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | undefined>>;
		}
	});

	test("value with many variants", () => {
		type Value = Enum<{ One: true; Two: { value: string } }, "custom">;

		// @ts-expect-error Is missing the `One` or `_` matcher case.
		void (() => Enum.on("custom").match({} as Value, {}));
		// @ts-expect-error Is missing the `Two` matcher case.
		void (() => Enum.on("custom").match({} as Value, { One: () => true }));

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

		// all cases and fallback
		{
			const fn = (value: Value) =>
				match(value, {
					One: () => "One" as const,
					Two: () => "Two" as const,
					_: undefined,
				});
			!0 as Expect<Equal<ReturnType<typeof fn>, "One" | "Two" | undefined>>;
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
		type Value = Enum<{ One: true; Two: { value: string } }, "custom">;

		// all cases
		{
			const fn = (value: Value) =>
				match(value, {
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
				match(value, {
					_: () => "Unknown",
				});

			expect(fn({ custom: "One" })).toEqual("Unknown");
			expect(fn({ custom: "Two", value: "Two" })).toEqual("Unknown");
			expect(fn({} as Value)).toEqual("Unknown");
		}

		{
			const fn = (value: Value) =>
				match(value, {
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
