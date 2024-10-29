import { Define } from "./define.js";

import type { Enum } from "../enum.js";

test("Define", () => {
	const Event = Define("_type")(
		{} as {
			Open: true;
			Data: { value: unknown };
			Close: true;
		},
	);
	type Event = Enum.define<typeof Event>;

	{
		const eventOpen = Event.Open();
		expect(eventOpen).toStrictEqual({ _type: "Open" });
		const eventData = Event.Data({ value: "..." });
		expect(eventData).toStrictEqual({ _type: "Data", value: "..." });
		const eventClose = Event.Close();
		expect(eventClose).toStrictEqual({ _type: "Close" });

		void [eventOpen, eventData, eventClose];
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
	type Event = Enum.define<typeof Event>;

	{
		const eventOpen = Event.Open();
		expect(eventOpen).toStrictEqual({ _type: "Open" });
		const eventData = Event.Data("...");
		expect(eventData).toStrictEqual({ _type: "Data", value: "..." });
		const eventClose = Event.Close();
		expect(eventClose).toStrictEqual({ _type: "Close" });

		void [eventOpen, eventData, eventClose];
	}
});
