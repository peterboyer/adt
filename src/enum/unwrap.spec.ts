import { Unwrap } from "./unwrap.js";

import type { Expect, Equal } from "../shared/testing.js";
import { Result } from "../result.js";

test("unwrap", () => {
	{
		const result = Result.Ok("foo") as Result<string, "FooError">;
		{
			const value = Unwrap("_type")(result, "Ok.value");
			expect(value).toEqual("foo");
			!0 as Expect<Equal<typeof value, string | undefined>>;
		}
		{
			const value = Unwrap("_type")(result, "Error.error");
			expect(value).toBeUndefined();
			!0 as Expect<Equal<typeof value, "FooError" | undefined>>;
		}
	}
});
