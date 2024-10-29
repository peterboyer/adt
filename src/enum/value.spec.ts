import { Value } from "./value.js";

import type { Equal, Expect } from "../shared/testing.js";
import type { Result } from "../result.js";

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
	{
		const value: Result = Value("_type")("Ok");
		expect(value).toStrictEqual({ _type: "Ok" });
		!0 as Expect<Equal<typeof value, Result>>;
	}
	{
		const value: Result<string> = Value("_type")("Ok", { value: "..." });
		expect(value).toStrictEqual({ _type: "Ok", value: "..." });
		!0 as Expect<Equal<typeof value, Result<string>>>;
	}
});
