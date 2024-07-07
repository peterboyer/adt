import type { Expect, Equal } from "./testing.js";
import type { Enum } from "./enum.js";

({}) as [
	Expect<
		Equal<
			Enum.Result,
			| { _type: "Value"; value?: undefined }
			| { _type: "Error"; error?: undefined; cause?: unknown }
		>
	>,
	Expect<
		Equal<
			Enum.Result<unknown>,
			| { _type: "Value"; value: unknown }
			| { _type: "Error"; error?: undefined; cause?: unknown }
		>
	>,
	Expect<
		Equal<
			Enum.Result<unknown, unknown>,
			| { _type: "Value"; value: unknown }
			| { _type: "Error"; error: unknown; cause?: unknown }
		>
	>,
];
