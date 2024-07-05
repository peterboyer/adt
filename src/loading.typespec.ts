import type { Expect, Equal } from "./testing.js";
import type { Loading } from "./loading.js";
import type { Result } from "./result.js";

({}) as [
	Expect<Equal<Loading, { _type: "Loading" }>>,
	Expect<
		Equal<
			Loading | Result.Ok<string>,
			{ _type: "Loading" } | { _type: "Ok"; value: string }
		>
	>,
];
