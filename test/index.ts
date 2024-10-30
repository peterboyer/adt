import { Enum, Pending, Result } from "unenum";

type WebEvent = Enum.define<typeof WebEvent>;
const WebEvent = Enum.define(
	{} as {
		PageLoad: true;
		PageUnload: true;
		KeyPress: { key: string };
		Paste: { content: string };
		Click: { x: number; y: number };
	},
	{
		KeyPress: (key: string) => ({ key }),
		Paste: (content: string) => ({ content }),
	},
);

function getWebEvent(): WebEvent | Enum<{ None: true }> {
	if ("".toString()) return WebEvent.PageLoad();
	if ("".toString()) return WebEvent.PageUnload();
	if ("".toString()) return WebEvent.KeyPress("x");
	if ("".toString()) return WebEvent.Paste("...");
	if ("".toString()) return WebEvent.Click({ x: 10, y: 10 });
	return Enum.value("None");
}

function inspect(event: WebEvent): string | undefined {
	if (Enum.match(event, "PageLoad")) console.log(event);
	else if (Enum.match(event, "PageUnload")) console.log(event);
	else if (Enum.match(event, "KeyPress")) console.log(event, event.key);
	else if (Enum.match(event, "Paste")) console.log(event, event.content);
	else if (Enum.match(event, "Click")) console.log(event, event.x, event.y);
	return "foo";
}

function getEventPageType(event: WebEvent): "load" | "unload" | undefined {
	return Enum.switch(event, {
		PageLoad: "load" as const,
		PageUnload: "unload" as const,
		_: undefined,
	});
}

function useAsyncResult(): Result<string, "FooError"> | Pending {
	if ("".toString()) return Result.Ok("...");
	if ("".toString()) return Result.Error("FooError");
	return Pending();
}

function app() {
	const result = useAsyncResult();
	Enum.switch(result, {
		Pending: () => console.log("..."),
		Ok: ({ value }) => console.log(value),
		Error: ({ error }) => console.error(error),
	});

	const event = getWebEvent();
	if (Enum.match(event, "None")) {
		return;
	}

	const eventPageType = getEventPageType(event);
	console.log(eventPageType);

	const $inspect = Result.from(() => inspect(event));
	if (Enum.match($inspect, "Error")) {
		return console.log($inspect.error);
	}
	return console.log(event);
}

void app();
