import { Value } from "./value.js";

import type { Expect, Equal } from "pb.expectequal";

test("Value", () => {
	{
		const value = Value("_type")("Foo");
		expect(value).toStrictEqual({ _type: "Foo" });
		!0 as Expect<Equal<typeof value, { _type: "Foo" }>>;
	}
	{
		const value = Value("_type")("Foo", { data: "..." });
		expect(value).toStrictEqual({ _type: "Foo", data: "..." });
		!0 as Expect<Equal<typeof value, { _type: "Foo"; data: string }>>;
	}
});
