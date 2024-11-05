import { Define } from "./define.js";

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
