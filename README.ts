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

// or manually instantiated with type ...
const light: Light = { _type: "On", intensity: 100 };
void light; //-
//<
//<<<

//>>>+ Typing, Matching, Switching.
//>
export function Light_getIntensity(light: Light): number | undefined {
	if (Enum.match(light, "Off")) {
		return undefined;
	}
	return light.intensity;
}

export function Light_formatState(light: Light): string {
	return Enum.switch(light, {
		On: ({ intensity }) => `Currently on with intensity: ${intensity}.`,
		Off: "Currently off.",
	});
}
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
	- [`Enum.on`](#enumon)
- Primitives
	- [`Enum.Value`](#enumvalue)
	- [`Enum.Error`](#enumerror)
	- [`Enum.Loading`](#enumloading)
	- [`Enum.Result`](#enumresult)
	- [`Enum.unwrapValue`](#enumunwrapvalue)
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
> It is recommended that you use [`Enum.define`](#enumdefine) with
[`Enum.infer`](#enuminfer) instead of [`Enum`](#enum) directly for regular use.
!*/

//>>> Using the default discriminant.
//>
export type Default = Enum<{
	UnitVariant: true;
	DataVariant: { value: string };
}>;

const unit: Default = { _type: "UnitVariant" };
void unit; //-
const data: Default = { _type: "DataVariant", value: "..." };
void data; //-
//<
//<<<

//>>> Using a custom discriminant.
//>
export type Custom = Enum<
	{
		UnitVariant: true;
		DataVariant: { value: string };
	},
	"kind"
>;

const unitCustom: Custom = { kind: "UnitVariant" };
void unitCustom; //-
const dataCustom: Custom = { kind: "DataVariant", value: "..." };
void dataCustom; //-
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
const getLightIntensity = (light: Light): number | undefined => {
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
const getFileFormat = (file: File): "text" | "image" => {
	if (Enum.on("mime").match(file, ["text/plain", "application/json"])) {
		return "text";
	}
	return "image";
};
void getFileFormat; //-
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
const formatLightState = (light: Light) =>
	Enum.switch(light, {
		On: ({ intensity }) => `On(${intensity})`,
		Off: "Off",
	});
void formatLightState; //-
//<
//<<<

//>>> Unhandled cases with fallback.
//>
const onFileSelect = (file: File) =>
	Enum.on("mime").switch(file, {
		"image/jpeg": () => prompt("Name for image:"),
		_: () => alert("Unsupported filetype."),
	});
void onFileSelect; //-
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
## `Enum.Result`

```
(type) Enum.Result<TValue?, TError?>
```

- A helper alias for `Enum.Value | Enum.Error`.
!*/

//>>> Enum.Result without any values.
//>
export function getResult(): Enum.Result {
	if (Math.random()) {
		return Enum.Error();
	}
	return Enum.Value();
}
//<
//<<<

//>>> Enum.Result with Value and Error values.
//>
export function queryFile(): Enum.Result<File, "NotFound"> {
	if (Math.random()) {
		return Enum.Error("NotFound");
	}
	const file = File["text/plain"]({ data: "..." });
	return Enum.Value(file);
}
//<
//<<<

//backtotop

/*!
```
(func) Enum.Result(callback)
```

- Executes the callback within a `try`/`catch`:
	- returns a `Enum.Value` with the callback's result,
	- otherwise a `Enum.Error` with the thrown error (if any).
!*/

//>>> Wrap a function that may throw.
//>
const $fetchData = await Enum.Result(() => fetch("/api/whoami"));

Enum.switch($fetchData, {
	Value: async ({ value: response }) => {
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
## `Enum.Value`

```
(type) Enum.Value<TValue?>
(func) Enum.Value(inferred) => Enum.Value<inferred>
```
!*/

//backtotop

/*!
## `Enum.Error`

```
(type) Enum.Error<TError?>
(func) Enum.Error(inferred) => Enum.Error<inferred>
```
!*/

//backtotop

/*!
## `Enum.unwrapValue`

```
(func) Enum.unwrapValue(result) => value | undefined
```

- Helper to access a `Value` variant's `value`, otherwise returning `undefined`.

> [!NOTE]
> Prefer using `Enum.match(result, "Error")` to handle errors instead of using
`Enum.unwrapValue(result)` to check for `undefined`.
!*/

//>>> Safely wrap throwable function call and unwrap value.
//>
const result = Enum.Result(() => JSON.stringify("..."));
const valueOrUndefined = Enum.unwrapValue(result);
void valueOrUndefined; //-
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
