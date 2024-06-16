import { Enum } from "./enum.js";

describe("Enum.define", () => {
	test("Default", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.define(
			{} as {
				Open: true;
				Data: { value: unknown };
				Close: true;
			},
		);

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

	test("with options.mapper", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.define(
			{} as {
				Open: true;
				Data: { value: unknown };
				Close: true;
			},
			{
				Data: (value: unknown) => ({ value }),
			},
		);

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

	test("with options.discriminant", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.on("custom").define(
			{} as {
				Open: true;
				Data: { value: unknown };
				Close: true;
			},
		);

		{
			const eventOpen: Event = { custom: "Open" };
			const eventData: Event = { custom: "Data", value: "..." };
			const eventClose: Event = { custom: "Close" };

			void [eventOpen, eventData, eventClose];
		}

		{
			const eventOpen = Event.Open();
			expect(eventOpen).toStrictEqual({ custom: "Open" });
			const eventData = Event.Data({ value: "..." });
			expect(eventData).toStrictEqual({ custom: "Data", value: "..." });
			const eventClose = Event.Close();
			expect(eventClose).toStrictEqual({ custom: "Close" });

			void [eventOpen, eventData, eventClose];
		}
	});

	test("options.discriminant + options.mapper", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.on("custom").define(
			{} as {
				Open: true;
				Data: { value: unknown };
				Close: true;
			},
			{
				Data: (value: unknown) => ({ value }),
			},
		);

		{
			const eventOpen: Event = { custom: "Open" };
			const eventData: Event = { custom: "Data", value: "..." };
			const eventClose: Event = { custom: "Close" };

			void [eventOpen, eventData, eventClose];
		}

		{
			const eventOpen = Event.Open();
			expect(eventOpen).toStrictEqual({ custom: "Open" });
			const eventData = Event.Data("...");
			expect(eventData).toStrictEqual({ custom: "Data", value: "..." });
			const eventClose = Event.Close();
			expect(eventClose).toStrictEqual({ custom: "Close" });

			void [eventOpen, eventData, eventClose];
		}
	});
});
