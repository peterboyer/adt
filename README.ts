//+ # Install

/*!
```shell
npm install unenum
```

## Requirements

- `typescript@>=5.0.0`
- `tsconfig.json > "compilerOptions" > { "strict": true }`
!*/

//+ # Usage

//>
import { Enum } from "unenum";
import { branch } from "./src/testing.js"; //-
//<

//>>>+ Defining.
//>
export type Light = Enum.infer<typeof Light>;
export const Light = Enum.define(
	{} as {
		On: { intensity: number };
		Off: true;
	},
);
//<
//<<<

//>>>+ Instantiating.
//>
Light.On({ intensity: 100 });
Light.Off();

// or instantiated with Enum.value ...
// prettier-ignore
{ //-
const light: Light = Enum.value("On", { intensity: 100 })
void light; //-
} //-

// or manually instantiated with type ...
// prettier-ignore
{ //-
const light: Light = { _type: "On", intensity: 100 };
void light; //-
} //-
//<
//<<<

//>>>+ Typing, Matching, Switching.
//>
function getLightIntensity(light: Light): number | undefined {
	if (Enum.match(light, "Off")) {
		return undefined;
	}
	return light.intensity;
}
void getLightIntensity; //-

function formatLightState(light: Light): string {
	return Enum.switch(light, {
		On: ({ intensity }) => `Currently on with intensity: ${intensity}.`,
		Off: "Currently off.",
	});
}
void formatLightState; //-
//<
//<<<

//>>> Using a mapper.
//>
export type Location = Enum.infer<typeof Location>;
export const Location = Enum.define(
	{} as {
		Unknown: true;
		Known: { lat: number; lng: number };
	},
	{
		Known: (lat: number, lng: number) => ({ lat, lng }),
	},
);
//<
//>
Location.Unknown();
Location.Known(-33.852, 151.21);

// or manually instantiated with type ...
const location: Location = { _type: "Known", lat: -33.852, lng: 151.21 };
void location; //-
//<
//<<<

//>>> Using a custom discriminant.
//>
type File = Enum.infer<typeof File>;
const File = Enum.on("mime").define(
	{} as {
		"text/plain": { data: string };
		"image/jpeg": { data: Buffer };
		"application/json": { data: unknown };
	},
);
//<

//>
File["text/plain"]({ data: "..." });
File["image/jpeg"]({ data: Buffer.from([]) });
File["application/json"]({ data: { items: [1, 2, 3] } });

// or manually instantiated with type ...
const file: File = { mime: "text/plain", data: "..." };
void file; //-
//<
//<<<

/*!
# API

- [`Enum`](#enum)
	- [`Enum.define`](#enumdefine)
	- [`Enum.infer`](#enuminfer)
	- [`Enum.match`](#enummatch)
	- [`Enum.switch`](#enumswitch)
	- [`Enum.value`](#enumvalue)
	- [`Enum.on`](#enumon)
- Primitives
	- [`Enum.Ok`](#enumok)
	- [`Enum.Error`](#enumerror)
	- [`Enum.Result`](#enumresult)
	- [`Enum.unwrapValue`](#enumunwrapvalue)
	- [`Enum.Loading`](#enumloading)
- Utilities
	- [`Enum.Root`](#enumroot)
	- [`Enum.Keys`](#enumkeys)
	- [`Enum.Pick`](#enumpick)
	- [`Enum.Omit`](#enumomit)
	- [`Enum.Extend`](#enumextend)
	- [`Enum.Merge`](#enummerge)
!*/

/*!
## `Enum`

```
(type) Enum<TVariants, TDiscriminant?>
```

- Creates a discriminated union `type` from a key-value map of variants.
- Use `true` for unit variants that don't have any data properties ([not
`{}`](https://www.totaltypescript.com/the-empty-object-type-in-typescript)).

> [!NOTE]
> Consider using [`Enum.define`](#enumdefine) with [`Enum.infer`](#enuminfer)
instead of [`Enum`](#enum) directly defining Enums.
!*/

//>>> Using the default discriminant.
//>
// prettier-ignore
{ //-
type Foo = Enum<{
	UnitVariant: true;
	DataVariant: { value: string };
}>;

const unit: Foo = { _type: "UnitVariant" };
void unit; //-
const data: Foo = { _type: "DataVariant", value: "..." };
void data; //-
} //-
//<
//<<<

//>>> Using a custom discriminant.
//>
// prettier-ignore
{ //-
type Foo = Enum<
	{
		UnitVariant: true;
		DataVariant: { value: string };
	},
	"kind"
>;

const unit: Foo = { kind: "UnitVariant" };
void unit; //-
const data: Foo = { kind: "DataVariant", value: "..." };
void data; //-
} //-
//<
//<<<

//backtotop

/*!
## `Enum.define`

```
(func) Enum.define(variants, options?: { [variant]: callback }) => builder
```

- See [#usage](#usage) for example.
!*/

//backtotop

/*!
## `Enum.infer`

```
(type) Enum.infer<TBuilder>
```

- See [#usage](#usage) for example.
!*/

//backtotop

/*!
## `Enum.match`

```
(func) Enum.match(value, variant | variants[]) => boolean
```
!*/

//>>> Match with one variant.
//>
// prettier-ignore
{ //-
function getLightIntensity(light: Light): number | undefined {
	if (Enum.match(light, "On")) {
		return light.intensity;
	}
	return undefined;
};
void getLightIntensity; //-
//<
//<<<

//>>> Match with many variants.
//>
function getFileFormat(file: File): boolean {
	const isText = Enum.on("mime").match(file, ["text/plain", "application/json"])
	return isText
};
void getFileFormat; //-
} //-
//<
//<<<

//backtotop

/*!
## `Enum.switch`

```
(func) Enum.switch(
	value,
	matcher = { [variant]: value | callback; _?: value | callback }
) => inferred
```
!*/

//>>> Handle all cases.
//>
// prettier-ignore
{ //-
function formatLightState(light: Light) {
	return Enum.switch(light, {
		On: ({ intensity }) => `On(${intensity})`,
		Off: "Off",
	});
}
void formatLightState; //-
//<
//<<<

//>>> Unhandled cases with fallback.
//>
function onFileSelect(file: File) {
	return Enum.on("mime").switch(file, {
		"image/jpeg": () => prompt("Name for image:"),
		_: () => alert("Unsupported filetype."),
	});
}
void onFileSelect; //-
} //-
//<
//<<<

//backtotop

/*!
## `Enum.value`

```
(func) Enum.value(variantName, variantProperties?) => inferred
```

- Useful if you add an additional Enum variant but don't have (or want to
define) a Enum builder for it.
!*/

//>>> Create an Enum value instance, (if possible) inferred from return type.
//>
function getOutput():
	| Enum.Loading
	| Enum<{ None: true; Some: { value: unknown } }> {
	if (branch()) return Enum.value("None");
	if (branch()) return Enum.value("Some", { value: "..." });
	if (branch()) return Enum.value("Loading");
	return Enum.Loading();
}
void getOutput; //-
//<
//<<<

//backtotop

/*!
## `Enum.on`

```
(func) Enum.on(discriminant) => { define, match, switch }
```

- Redefines and returns all `Enum.*` runtime methods with a custom discriminant.
!*/

//>>> Define and use an Enum with a custom discriminant.
//>
type Foo = Enum.infer<typeof Foo>;
const Foo = Enum.on("kind").define({} as { A: true; B: true });

const value = Foo.A() as Foo;
Enum.on("kind").match(value, "A");
Enum.on("kind").switch(value, { A: "A Variant", _: "Other Variant" });
//<
//<<<

//backtotop

//+ # Primitives

/*!
## `Enum.Ok`

```
(type) Enum.Ok<TOk?>
(func) Enum.Ok(inferred) => Enum.Ok<inferred>
```

- Represents a normal/success value, `{ _type: "Ok"; value: "..." }`.
!*/

//backtotop

/*!
## `Enum.Error`

```
(type) Enum.Error<TError?>
(func) Enum.Error(inferred, cause?) => Enum.Error<inferred>
```

- Represents an error/failure value, `{ _type: "Error"; error: "..."; cause?: ... }`.
!*/

//backtotop

/*!
## `Enum.Result`

```
(type) Enum.Result<TOk?, TError?>
```

- A helper alias for `Enum.Ok | Enum.Error`.

> [!NOTE]
> This "Errors As Values" pattern allows known error cases to handled in a
type-safe way, as opposed to `throw`ing errors and relying on the caller to
remember to wrap it in `try`/`catch`.
!*/

//>>> Enum.Result without any values.
//>
export function getResult(): Enum.Result {
	const isValid = Math.random();

	if (!isValid) {
		return Enum.Error();
	}

	return Enum.Ok();
}
//<
//<<<

//>>> Enum.Result with Ok and Error values.
//>
const getFile = (): File | undefined => undefined; //-
export function queryFile(): Enum.Result<File, "NotFound"> {
	const fileOrUndefined = getFile();

	if (fileOrUndefined) {
		return Enum.Error("NotFound");
	}

	return Enum.Ok(file);
}
//<
//<<<

//+ <br />

/*!
```
(func) Enum.Result(callback)
```

- Executes the callback within a `try`/`catch`:
	- returns a `Enum.Ok` with the callback's result,
	- otherwise a `Enum.Error` with the thrown error (if any).
!*/

//>>> Wrap a function that may throw.
//>
const fetchResult = await Enum.Result(() => fetch("/api/whoami"));

Enum.switch(fetchResult, {
	Ok: async ({ value: response }) => {
		const body = (await response.json()) as unknown;
		console.log(body);
	},
	Error: ({ error }) => {
		console.error(error);
	},
});
//<
//<<<

//backtotop

/*!
## `Enum.unwrapValue`

```
(func) Enum.unwrapValue(result) => value | undefined
```

- Helper to extract `value` of the `Ok` variant, otherwise returning
`undefined` (e.g. in the case of an `Error`).
- Equivalent to `Enum.match(result, "Ok") ? result.value : undefined`.

> [!NOTE]
> Prefer using `Enum.match(result, "Error"))` with the "Early Return" pattern
to handle errors by
[type-narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
instead of using `Enum.unwrapValue(result)` to check for `undefined`.
!*/

//>>> Safely wrap throwable function call, then unwrap the value or use a fallback.
//>
const result = Enum.Result(() => JSON.stringify("..."));
const valueOrFallback = Enum.unwrapValue(result) ?? "null";
void valueOrFallback; //-
//<
//<<<

//backtotop

/*!
## `Enum.Loading`

```
(type) Enum.Loading
(func) Enum.Loading() => Enum.Loading
```

- Represents an loading state.
- Ideal for states' values or stateful functions (like React hooks).
!*/

//>>> React hook that returns a value, error, or loading state.
//>
const useQuery = {} as any; //-
const gqlListItems = {} as any; //-
function useFetchedListItems():
	| Enum.Result<string[], "NetworkError">
	| Enum.Loading {
	const { data, error, loading } = useQuery(gqlListItems);

	if (loading) {
		return Enum.Loading();
	}

	if (error || !data) {
		return Enum.Error("NetworkError");
	}

	return Enum.Ok(data.gqlListItems.items);
}
void useFetchedListItems; //-
//<
//<<<

//>>> React state that could be a loaded value, error, or loading state.
//>
type Element = any; //-
const useState = <T>(_t: T) => ({}) as [T, (t: T) => void]; //-
const useEffect = (_cb: () => void, _deps: never[]) => undefined; //-
function Component(): Element {
	const [state, setState] = useState<
		Enum.Result<{ items: string[] }, "NetworkError"> | Enum.Loading
	>(Enum.Loading());

	// fetch data and exclusively handle success or error states
	useEffect(() => {
		(async () => {
			const responseResult = await Enum.Result(() =>
				fetch("/items").then(
					(response) => response.json() as Promise<{ items: string[] }>,
				),
			);

			if (Enum.match(responseResult, "Error")) {
				setState(Enum.Error("NetworkError"));
				return;
			}

			setState(Enum.Ok({ items: responseResult.value.items }));
			return;
		})();
	}, []);

	// exhaustively handle all possible states
	return Enum.switch(state, {
		Loading: () => `<Spinner />`,
		Ok: ({ value: { items } }) => `<ul>${items.map(() => `<li />`)}</ul>`,
		Error: ({ error }) => `<span>A ${error} error has occurred.</span>`,
	});
}
void Component; //-
//<
//<<<

//backtotop

//+ # Utilities

//>
// example
type Signal = Enum<{ Red: true; Yellow: true; Green: true }>;
//<

/*!
## `Enum.Root`

```
(type) Enum.Root<TEnum, TDiscriminant?>
```
!*/

//>>> Infer a key/value mapping of an Enum's variants.
//>
export type Root = Enum.Root<Signal>;
// -> { Red: true, Yellow: true; Green: true }
//<
//<<<

//backtotop

/*!
## `Enum.Keys`

```
(type) Enum.Keys<TEnum, TDiscriminant?>
```
!*/
//>>> Infers all keys of an Enum's variants.
//>
export type Keys = Enum.Keys<Signal>;
// -> "Red" | "Yellow" | "Green"
//<
//<<<

//backtotop

/*!
## `Enum.Pick`

```
(type) Enum.Pick<TEnum, TKeys, TDiscriminant?>
```
!*/
//>>> Pick subset of an Enum's variants by key.
//>
export type PickRed = Enum.Pick<Signal, "Red">;
// -> *Red

export type PickRedYellow = Enum.Pick<Signal, "Red" | "Yellow">;
// -> *Red | *Yellow
//<
//<<<

//backtotop

/*!
## `Enum.Omit`

```
(type) Enum.Omit<TEnum, TKeys, TDiscriminant?>
```
!*/
//>>> Omit subset of an Enum's variants by key.
//>
export type OmitRed = Enum.Omit<Signal, "Red">;
// -> *Yellow | *Green

export type OmitRedYellow = Enum.Omit<Signal, "Red" | "Yellow">;
// -> *Green
//<
//<<<

//backtotop

/*!
## `Enum.Extend`

```
(type) Enum.Extend<TEnum, TVariants, TDiscriminant?>
```
!*/

//>>> Add new variants and merge new properties for existing variants for an Enum.
//>
export type Extend = Enum.Extend<Signal, { Flashing: true }>;
// -> *Red | *Yellow | *Green | *Flashing
//<
//<<<

//backtotop

/*!
## `Enum.Merge`

```
(type) Enum.Merge<TEnums, TDiscriminant?>
```
!*/

//>>> Merge all variants and properties of all given Enums.
//>
export type Merge = Enum.Merge<Enum<{ Left: true }> | Enum<{ Right: true }>>;
// -> *Left | *Right
//<
//<<<

//backtotop
