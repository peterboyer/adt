import { Enum } from "./enum.js";

describe("Enum", () => {
	test("Default", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.new<{
			Open: true;
			Data: { value: unknown };
			Close: true;
		}>();

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

	test("Mapped", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.new<{
			Open: true;
			Data: { value: unknown };
			Close: true;
		}>().mapper({
			Data: (value: unknown) => ({ value }),
		});

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

	test("Custom", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.new<{
			Open: true;
			Data: { value: unknown };
			Close: true;
		}>().discriminant("custom");

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

	test("Custom Mapped", () => {
		type Event = typeof $Event;
		const [Event, $Event] = Enum.new<{
			Open: true;
			Data: { value: unknown };
			Close: true;
		}>()
			.discriminant("custom")
			.mapper({
				Data: (value: unknown) => ({ value }),
			});

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
