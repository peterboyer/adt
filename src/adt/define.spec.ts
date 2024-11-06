import { Define } from "./define.js";

import { z } from "zod";
import type { ADT } from "../adt.js";

const value = "...";

test("Define", () => {
	const Event = Define("$type")(
		{} as {
			Open: true;
			Data: { value: unknown };
			Close: true;
		},
	);
	type Event = ADT.define<typeof Event>;

	{
		expect(Event.Open()).toStrictEqual({ $type: "Open" });
		expect(Event.Data({ value })).toStrictEqual({ $type: "Data", value });
		expect(Event.Close()).toStrictEqual({ $type: "Close" });
	}
});

test("Define with options.mapper", () => {
	const Event = Define("$type")(
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
		expect(Event.Open()).toStrictEqual({ $type: "Open" });
		expect(Event.Data(value)).toStrictEqual({ $type: "Data", value });
		expect(Event.Close()).toStrictEqual({ $type: "Close" });
	}
});

test("Extended with extra properties", () => {
	const EventSchema = z.union([
		z.object({
			$type: z.literal("Open"),
		}),
		z.object({
			$type: z.literal("Data"),
			value: z.unknown(),
		}),
		z.object({
			$type: z.literal("Close"),
		}),
	]);

	type Event = z.infer<typeof EventSchema>;

	{
		const Event = Object.assign(Define("$type")({} as ADT.Root<Event>), {
			$schema: EventSchema,
		});

		expect(Event.$schema).toBe(EventSchema);
		expect(Event.Open()).toEqual({ $type: "Open" });
		expect(Event.Data({ value: 1 })).toEqual({ $type: "Data", value: 1 });
	}

	{
		const Event = Object.assign(
			Define("$type")({} as ADT.Root<Event>, {
				Data: (value: unknown) => ({ value }),
			}),
			{ $schema: EventSchema },
		);

		expect(Event.$schema).toBe(EventSchema);
		expect(Event.Open()).toEqual({ $type: "Open" });
		expect(Event.Data(1)).toEqual({ $type: "Data", value: 1 });
	}
});
