import type { Expect, Equal } from "./testing.js";
import type { Result } from "./result.js";

({}) as [
	Expect<
		Equal<
			Result,
			| { _type: "Ok"; value?: undefined }
			| { _type: "Error"; error?: undefined; cause?: unknown }
		>
	>,
	Expect<
		Equal<
			Result<unknown>,
			| { _type: "Ok"; value: unknown }
			| { _type: "Error"; error?: undefined; cause?: unknown }
		>
	>,
	Expect<
		Equal<
			Result<unknown, unknown>,
			| { _type: "Ok"; value: unknown }
			| { _type: "Error"; error: unknown; cause?: unknown }
		>
	>,
];
