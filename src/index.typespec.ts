import { ADT } from "pb.adt";

const WebEvent = ADT.define(
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

type WebEvent = ADT.define<typeof WebEvent>;

void function inspect(event: WebEvent): string | undefined {
	if (ADT.match(event, "PageLoad")) console.log(event);
	else if (ADT.match(event, "PageUnload")) console.log(event);
	else if (ADT.match(event, "KeyPress")) console.log(event, event.key);
	else if (ADT.match(event, "Paste")) console.log(event, event.content);
	else if (ADT.match(event, "Click")) console.log(event, event.x, event.y);
	return "foo";
};

function getWebEvent(): WebEvent | ADT<{ None: true }> {
	if ("".toString()) return WebEvent.PageLoad();
	if ("".toString()) return WebEvent.PageUnload();
	if ("".toString()) return WebEvent.KeyPress("x");
	if ("".toString()) return WebEvent.Paste("...");
	if ("".toString()) return WebEvent.Click({ x: 10, y: 10 });
	return ADT.value("None");
}

void function app() {
	const event = getWebEvent();

	if (ADT.match(event, "None")) {
		return;
	}

	return ADT.switch(event, {
		PageLoad: "load" as const,
		PageUnload: "unload" as const,
		_: undefined,
	});
};
