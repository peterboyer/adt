import { Unwrap } from "./unwrap.js";

import type { Expect, Equal } from "pb.expectequal";
import { ADT } from "../adt.js";

test("unwrap", () => {
	const Foo = ADT.define(
		{} as {
			Init: true;
			Open: { openId: string };
			Close: { closeId: number };
		},
	);
	type Foo = ADT.define<typeof Foo>;

	const foo = Foo.Open({ openId: "..." }) as Foo;
	{
		const value = Unwrap("_type")(foo, "Open.openId");
		expect(value).toEqual("...");
		!0 as Expect<Equal<typeof value, string | undefined>>;
	}
	{
		const value = Unwrap("_type")(foo, "Close.closeId");
		expect(value).toBeUndefined();
		!0 as Expect<Equal<typeof value, number | undefined>>;
	}
});
