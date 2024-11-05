import { Match } from "./match.js";

import type { Expect, Equal } from "pb.expectequal";
import { Enum } from "../enum.js";

test("Match", () => {
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
		if (Match("_type")(event, "Open")) {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Open">>>];
		} else if (Match("_type")(event, "Data")) {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Data">>>];
		} else {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Close">>>];
		}
	}

	{
		if (Match("_type")(event, ["Open", "Close"])) {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Open" | "Close">>>];
		} else {
			({}) as [Expect<Equal<typeof event, Enum.Pick<Event, "Data">>>];
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
