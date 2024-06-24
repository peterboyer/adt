import type { Expect, Equal } from "./testing.js";
import type { Loading } from "./loading.js";
import type { Result } from "./result.js";

({}) as [
	Expect<Equal<Loading, { _type: "Loading" }>>,
	Expect<
		Equal<
			Loading | Loading.Ready<string>,
			{ _type: "Loading" } | { _type: "Ready"; value: string }
		>
	>,
	Expect<Equal<Loading.Ready, { _type: "Ready"; value?: undefined }>>,
	Expect<Equal<Loading.Ready<string>, { _type: "Ready"; value: string }>>,
	Expect<
		Equal<
			Loading | Result,
			| { _type: "Loading" }
			| { _type: "Ok"; value?: undefined }
			| { _type: "Error"; error?: undefined; cause?: unknown }
		>
	>,
];
