import { Define } from "./define.js";

import { z } from "zod";
import type { ADT } from "../adt.js";

const value = "...";

test("Define", () => {
	const Event = Define("_type")(
		{} as {
			Open: true;
			Data: { value: unknown };
			Close: true;
		},
	);
	type Event = ADT.define<typeof Event>;

	{
		expect(Event.Open()).toStrictEqual({ _type: "Open" });
		expect(Event.Data({ value })).toStrictEqual({ _type: "Data", value });
		expect(Event.Close()).toStrictEqual({ _type: "Close" });
	}
});

test("Define with options.mapper", () => {
	const Event = Define("_type")(
		{} as {
			Open: true;
			Data: { value: unknown };
			Close: true;
		},
		{
			Data: (value: unknown) => ({ value }),
		},
	);
	type Event = ADT.define<typeof Event>;

	{
		expect(Event.Open()).toStrictEqual({ _type: "Open" });
		expect(Event.Data(value)).toStrictEqual({ _type: "Data", value });
		expect(Event.Close()).toStrictEqual({ _type: "Close" });
	}
});

test("Extended with extra properties", () => {
	const EventSchema = z.union([
		z.object({
			_type: z.literal("Open"),
		}),
		z.object({
			_type: z.literal("Data"),
			value: z.unknown(),
		}),
		z.object({
			_type: z.literal("Close"),
		}),
	]);

	type Event = z.infer<typeof EventSchema>;

	{
		const Event = Object.assign(Define("_type")({} as ADT.Root<Event>), {
			$schema: EventSchema,
		});

		expect(Event.$schema).toBe(EventSchema);
		expect(Event.Open()).toEqual({ _type: "Open" });
		expect(Event.Data({ value: 1 })).toEqual({ _type: "Data", value: 1 });
	}

	{
		const Event = Object.assign(
			Define("_type")({} as ADT.Root<Event>, {
				Data: (value: unknown) => ({ value }),
			}),
			{ $schema: EventSchema },
		);

		expect(Event.$schema).toBe(EventSchema);
		expect(Event.Open()).toEqual({ _type: "Open" });
		expect(Event.Data(1)).toEqual({ _type: "Data", value: 1 });
	}
});
