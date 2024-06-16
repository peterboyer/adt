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

//>
export type Light = typeof $Light;
export const [Light, $Light] = Enum.define(
	{} as {
		On: { intensity: number };
		Off: true;
	},
);
//<

//>
Light.On({ intensity: 100 });
Light.Off();

// or manually instantiated with type ...
const light: Light = { _type: "On", intensity: 100 };
void light; //-
//<

//>
export function Light_isOn(light: Light): boolean {
	return Enum.match(light, "On");
}

export function Light_formatState(light: Light): string {
	return Enum.switch(light, {
		On: ({ intensity }) => `Currently on with intensity: ${intensity}.`,
		Off: "Currently off.",
	});
}
//<

//+ ## with a mapper

//+ <details>
//+ <summary>Example</summary>

//>
export type Location = typeof $Location;
export const [Location, $Location] = Enum.define(
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

//+ </details>

//+ ## with a custom discriminant

//+ <details>
//+ <summary>Example</summary>

//>
type File = typeof $File;
const [File, $File] = Enum.on("mime").define(
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

//+ </details>

/*!
# API

- [`Enum`](#enum)
	- [`Enum.define`](#enumdefine)
	- [`Enum.match`](#enummatch)
	- [`Enum.switch`](#enumswitch)
	- [`Enum.on`](#enumon)
- [`Result`](#result)
	- [`Result.Ok`](#resultok)
	- [`Result.Error`](#resulterror)
	- [`Result.from`](#resultfrom)
- Type Utilities
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
Enum<TVariants, TDiscriminant?>
```

> [!NOTE]
> Recommend that you use [`Enum.define`](#enumdefine) instead of
[`Enum`](#enum) directly.

- Creates a discriminated union `type` from a key-value map of variants.
- Use `true` for unit variants that don't have any data properties (not `{}`).
!*/

//+ #### Using the default discriminant

//>
export type Default = Enum<{
	UnitVariant: true;
	DataVariant: { value: string };
}>;

const example_unit: Default = { _type: "UnitVariant" };
void example_unit; //-
const example_data: Default = { _type: "DataVariant", value: "..." };
void example_data; //-
//<

//+ #### Using a custom discriminant

//>
export type Custom = Enum<
	{
		UnitVariant: true;
		DataVariant: { value: string };
	},
	"kind"
>;

const custom_unit: Custom = { kind: "UnitVariant" };
void custom_unit; //-
const custom_data: Custom = { kind: "DataVariant", value: "..." };
void custom_data; //-
//<

//return

/*!
## `Enum.define`

```
Enum.define(variants, options?) => [builder, type]

options.discriminant = string
options.mapper = { [variant]: callback }
```
!*/

/*!
#### Examples

- [Usage](#usage)
- [Usage with a mapper](#with-a-mapper)
- [Usage with a custom discriminant](#with-a-custom-discriminant)
!*/

//return

/*!
## `Enum.match`

```
Enum.match(value, variant | variants[]) => boolean
```
!*/

//+ #### Match with one variant

//>
const getLightIntensity = (light: Light): number | undefined => {
	if (Enum.match(light, "On")) {
		return light.intensity;
	}
	return undefined;
};
void getLightIntensity; //-
//<

//+ #### Match with many variants

//>
const getFileFormat = (file: File): "text" | "image" => {
	if (Enum.on("mime").match(file, ["text/plain", "application/json"])) {
		return "text";
	}
	return "image";
};
void getFileFormat; //-
//<

//return

/*!
## `Enum.switch`

```
Enum.switch(value, matcher) => inferred

matcher[variant]: value | callback
matcher._: value | callback
```
!*/

//+ #### Handle all cases

//>
const formatLightState = (light: Light) =>
	Enum.switch(light, {
		On: ({ intensity }) => `On(${intensity})`,
		Off: "Off",
	});
void formatLightState; //-
//<

//+ #### Unhandled cases with fallback

//>
const onFileSelect = (file: File) =>
	Enum.on("mime").switch(file, {
		"image/jpeg": () => prompt("Name for image:"),
		_: () => alert("Unsupported filetype."),
	});
void onFileSelect; //-
//<

//return

/*!
## `Enum.on`

```
Enum.on(discriminant) => { define, match, switch }
```

- Redefines and returns all `Enum.*` methods with a given custom discriminant.
!*/

/*!
#### Examples

- [Usage with a custom discriminant](#with-a-custom-discriminant)
!*/

//return

/*!
## `Result`

```
Result<TOk?, TError?>
```
!*/

//>
import { Result } from "unenum";
//<

//+ #### Result without any values

//>
export function getResult(): Result {
	if (Math.random()) {
		return Result.Error();
	}
	return Result.Ok();
}
//<

//+ #### Result with Ok and Error values

//>
export function queryFile(): Result<File, "NotFound"> {
	if (Math.random()) {
		return Result.Error("NotFound");
	}
	const file = File["text/plain"]({ data: "..." });
	return Result.Ok(file);
}

const fileOrUndefined = queryFile().value;
void fileOrUndefined; //-
//<

//return

/*!
## `Result.Ok`

```
Result.Ok(value | value?) => Result.Ok<inferred>
Result.Ok<TOk?>
```
!*/

//return

/*!
## `Result.Error`

```
Result.Error(error | error?) => Result.Error<inferred>
Result.Error<TError?>
```
!*/

//return

/*!
## `Result.from`

```
Result.from(callback)
```

- Executes the callback within a `try`/`catch`:
	- returns a `Result.Ok` with the callback's result,
	- otherwise a `Result.Error` with the thrown error (if any).
!*/

//>
const $fetchData = await Result.from(() => fetch("/api/whoami"));

Enum.switch($fetchData, {
	Ok: async ({ value: response }) => {
		const body = (await response.json()) as unknown;
		console.log(body);
	},
	Error: ({ error }) => {
		console.error(error);
	},
});
//<

//return

//+ # `Enum` Type Utilities

//>
// example
type Signal = Enum<{ Red: true; Yellow: true; Green: true }>;
//<

//+ <br/>

/*!
## `Enum.Root`
- Infers a key/value mapping of an Enum's variants.
!*/

//>
export type Root = Enum.Root<Signal>;
// -> { Red: true, Yellow: true; Green: true }
//<

//return

/*!
## `Enum.Keys`
- Infers all keys of an Enum's variants.
!*/

//>
export type Keys = Enum.Keys<Signal>;
// -> "Red" | "Yellow" | "Green"
//<

//return

/*!
## `Enum.Pick`
- Pick subset of an Enum's variants by key.
!*/

//>
export type PickRed = Enum.Pick<Signal, "Red">;
// -> *Red

export type PickRedYellow = Enum.Pick<Signal, "Red" | "Yellow">;
// -> *Red | *Yellow
//<

//return

/*!
## `Enum.Omit`
- Omit subset of an Enum's variants by key.
!*/

//>
export type OmitRed = Enum.Omit<Signal, "Red">;
// -> *Yellow | *Green

export type OmitRedYellow = Enum.Omit<Signal, "Red" | "Yellow">;
// -> *Green
//<

//return

/*!
## `Enum.Extend`
- Add new variants and merge new properties for existing variants for an Enum.
!*/

//>
export type Extend = Enum.Extend<Signal, { Flashing: true }>;
// -> *Red | *Yellow | *Green | *Flashing
//<

//return

/*!
## `Enum.Merge`
- Merge all variants and properties of all given Enums.
!*/

//>
export type Merge = Enum.Merge<Enum<{ Left: true }> | Enum<{ Right: true }>>;
// -> *Left | *Right
//<

//return
