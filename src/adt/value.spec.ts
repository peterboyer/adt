import { Value } from "./value.js";

import type { Expect, Equal } from "pb.expectequal";

test("Value", () => {
	{
		const value = Value("$type")("Foo");
		expect(value).toStrictEqual({ $type: "Foo" });
		!0 as Expect<Equal<typeof value, { $type: "Foo" }>>;
	}
	{
		const value = Value("$type")("Foo", { data: "..." });
		expect(value).toStrictEqual({ $type: "Foo", data: "..." });
		!0 as Expect<Equal<typeof value, { $type: "Foo"; data: string }>>;
	}
});
