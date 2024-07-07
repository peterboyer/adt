import { Enum } from "./enum.js";
import type { Equal, Expect } from "./testing.js";

test("Enum.value", () => {
	{
		const value = Enum.value("Foo");
		expect(value).toStrictEqual({ _type: "Foo" });
		!0 as Expect<Equal<typeof value, { _type: "Foo" }>>;
	}
	{
		const value = Enum.value("Foo", { data: "..." });
		expect(value).toStrictEqual({ _type: "Foo", data: "..." });
		!0 as Expect<Equal<typeof value, { _type: "Foo"; data: string }>>;
	}
	{
		const value: Enum.Result = Enum.value("Ok");
		expect(value).toStrictEqual({ _type: "Ok" });
		!0 as Expect<Equal<typeof value, Enum.Result>>;
	}
	{
		const value: Enum.Result<string> = Enum.value("Ok", { value: "..." });
		expect(value).toStrictEqual({ _type: "Ok", value: "..." });
		!0 as Expect<Equal<typeof value, Enum.Result<string>>>;
	}
});
