import { Match } from "./match.js";

import type { Expect, Equal } from "pb.expectequal";
import { ADT } from "../adt.js";

test("Match", () => {
	const Event = ADT.define(
		{} as {
			Open: true;
			Data: { value: unknown };
			Close: true;
		},
	);
	type Event = ADT.define<typeof Event>;

	const event = {} as Event;

	{
		if (Match("_type")(event, "Open")) {
			({}) as [Expect<Equal<typeof event, ADT.Pick<Event, "Open">>>];
		} else if (Match("_type")(event, "Data")) {
			({}) as [Expect<Equal<typeof event, ADT.Pick<Event, "Data">>>];
		} else {
			({}) as [Expect<Equal<typeof event, ADT.Pick<Event, "Close">>>];
		}
	}

	{
		if (Match("_type")(event, ["Open", "Close"])) {
			({}) as [Expect<Equal<typeof event, ADT.Pick<Event, "Open" | "Close">>>];
		} else {
			({}) as [Expect<Equal<typeof event, ADT.Pick<Event, "Data">>>];
		}
	}

	{
		const event = Event.Open() as Event;
		expect(Match("_type")(event, "Open")).toEqual(true);
		expect(Match("_type")(event, "Data")).toEqual(false);
		expect(Match("_type")(event, ["Open", "Close"])).toEqual(true);
		expect(Match("_type")(event, ["Data", "Close"])).toEqual(false);
	}
});
