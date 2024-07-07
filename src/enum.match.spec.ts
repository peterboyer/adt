import type { Equal, Expect } from "./testing.js";
import { Enum } from "./enum.js";

describe("Enum.match", () => {
	test("Default", () => {
		type Event = Enum.infer<typeof Event>;
		const Event = Enum.define(
			{} as {
				Open: true;
				Data: { value: unknown };
				Close: true;
			},
		);

		const event = {} as Event;

		{
			if (Enum.match(event, "Open")) {
				({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Open">>>];
			} else if (Enum.match(event, "Data")) {
				({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Data">>>];
			} else {
				({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Close">>>];
			}
		}

		{
			if (Enum.match(event, ["Open", "Close"])) {
				({}) as [
					Expect<Equal<typeof event, Enum.Pick<Event, "Open" | "Close">>>,
				];
			} else {
				({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Data">>>];
			}
		}

		{
			const event = Event.Open() as Event;
			expect(Enum.match(event, "Open")).toEqual(true);
			expect(Enum.match(event, "Data")).toEqual(false);
			expect(Enum.match(event, ["Open", "Close"])).toEqual(true);
			expect(Enum.match(event, ["Data", "Close"])).toEqual(false);
		}
	});

	test("Custom", () => {
		type Event = Enum.infer<typeof Event>;
		const Event = Enum.on("custom").define(
			{} as {
				Open: true;
				Data: { value: unknown };
				Close: true;
			},
		);

		const event = {} as Event;

		{
			if (Enum.on("custom").match(event, "Open")) {
				({}) as [
					Expect<Equal<typeof event, Enum.Pick<Event, "Open", "custom">>>,
				];
			} else if (Enum.on("custom").match(event, "Data")) {
				({}) as [
					Expect<Equal<typeof event, Enum.Pick<Event, "Data", "custom">>>,
				];
			} else {
				({}) as [
					Expect<Equal<typeof event, Enum.Pick<Event, "Close", "custom">>>,
				];
			}
		}

		{
			if (Enum.on("custom").match(event, ["Open", "Close"])) {
				({}) as [
					Expect<
						Equal<typeof event, Enum.Pick<Event, "Open" | "Close", "custom">>
					>,
				];
			} else {
				({}) as [
					Expect<Equal<typeof event, Enum.Pick<Event, "Data", "custom">>>,
				];
			}
		}

		{
			const event = Event.Open() as Event;
			expect(Enum.on("custom").match(event, "Open")).toEqual(true);
			expect(Enum.on("custom").match(event, "Data")).toEqual(false);
			expect(Enum.on("custom").match(event, ["Open", "Close"])).toEqual(true);
			expect(Enum.on("custom").match(event, ["Data", "Close"])).toEqual(false);
		}
	});
});
