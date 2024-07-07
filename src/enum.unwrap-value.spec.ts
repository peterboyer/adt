import { Enum } from "./enum.js";
import type { Expect, Equal } from "./testing.js";

describe("Enum.unwrapValue", () => {
	test("unwrap", () => {
		{
			const result = Enum.Ok("foo");
			expect(Enum.unwrapValue(result)).toEqual("foo");
		}
		{
			const result = Enum.Error("foo");
			expect(Enum.unwrapValue(result)).toBeUndefined();
		}

		{
			const result = {} as Enum.Result<string | undefined, "FooError">;
			const value = Enum.unwrapValue(result);
			!0 as Expect<Equal<typeof value, string | undefined>>;
		}

		{
			const result = {} as Enum.Ok<string>;
			const value = Enum.unwrapValue(result);
			!0 as Expect<Equal<typeof value, string>>;
		}
	});
});
