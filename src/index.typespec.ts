import { Enum } from "pb.adt";

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

type WebEvent = Enum.define<typeof WebEvent>;

void function inspect(event: WebEvent): string | undefined {
	if (Enum.match(event, "PageLoad")) console.log(event);
	else if (Enum.match(event, "PageUnload")) console.log(event);
	else if (Enum.match(event, "KeyPress")) console.log(event, event.key);
	else if (Enum.match(event, "Paste")) console.log(event, event.content);
	else if (Enum.match(event, "Click")) console.log(event, event.x, event.y);
	return "foo";
};

function getWebEvent(): WebEvent | Enum<{ None: true }> {
	if ("".toString()) return WebEvent.PageLoad();
	if ("".toString()) return WebEvent.PageUnload();
	if ("".toString()) return WebEvent.KeyPress("x");
	if ("".toString()) return WebEvent.Paste("...");
	if ("".toString()) return WebEvent.Click({ x: 10, y: 10 });
	return Enum.value("None");
}

void function app() {
	const event = getWebEvent();

	if (Enum.match(event, "None")) {
		return;
	}

	return Enum.switch(event, {
		PageLoad: "load" as const,
		PageUnload: "unload" as const,
		_: undefined,
	});
};
