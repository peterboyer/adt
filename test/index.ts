import { Enum, Async, Result } from "unenum";

type WebEvent = Enum<{
	PageLoad: true;
	PageUnload: true;
	KeyPress: { key: string };
	Paste: { content: string };
	Click: { x: number; y: number };
}>;

const WebEvent = Enum.builder({} as WebEvent, {
	KeyPress: (key: string) => ({ key }),
	Paste: (content: string) => ({ content }),
});

function getWebEvent(): WebEvent | Enum<{ None: true }> {
	if ("".toString()) return WebEvent.PageLoad();
	if ("".toString()) return WebEvent.PageUnload();
	if ("".toString()) return WebEvent.KeyPress("x");
	if ("".toString()) return WebEvent.Paste("...");
	if ("".toString()) return WebEvent.Click({ x: 10, y: 10 });
	return { _type: "None" };
}

function inspect(event: WebEvent): string | undefined {
	if (Enum.is(event, "PageLoad")) console.log(event);
	else if (Enum.is(event, "PageUnload")) console.log(event);
	else if (Enum.is(event, "KeyPress")) console.log(event, event.key);
	else if (Enum.is(event, "Paste")) console.log(event, event.content);
	else if (Enum.is(event, "Click")) console.log(event, event.x, event.y);
	return "foo";
}

function getEventPageType(event: WebEvent): "load" | "unload" | undefined {
	return Enum.match(event, {
		PageLoad: "load" as const,
		PageUnload: "unload" as const,
		_: undefined,
	});
}

function useAsyncResult(): Async<Result<string, "FooError">> {
	if ("".toString()) return Result.Ok("...");
	if ("".toString()) return Result.Error("FooError");
	return Async.Pending();
}

function app() {
	const result = useAsyncResult();
	Enum.match(result, {
		Pending: () => console.log("..."),
		Ok: ({ value }) => console.log(value),
		Error: ({ error }) => console.error(error),
	});

	const event = getWebEvent();
	if (Enum.is(event, "None")) {
		return;
	}

	const eventPageType = getEventPageType(event);
	console.log(eventPageType);

	const $inspect = Result.from(() => inspect(event));
	if (Enum.is($inspect, "Error")) {
		return console.log($inspect.error);
	}
	return console.log(event);
}

void app();
