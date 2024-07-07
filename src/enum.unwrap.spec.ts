import { Enum } from "./enum.js";
import type { Expect, Equal } from "./testing.js";

test("Enum.unwrap", () => {
	{
		const result = Enum.Ok("foo") as Enum.Result<string, "FooError">;
		{
			const value = Enum.unwrap(result, "Ok.value");
			expect(value).toEqual("foo");
			!0 as Expect<Equal<typeof value, string | undefined>>;
		}
		{
			const value = Enum.unwrap(result, "Error.error");
			expect(value).toBeUndefined();
			!0 as Expect<Equal<typeof value, "FooError" | undefined>>;
		}
	}
});
