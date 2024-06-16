# Install

```shell
npm install unenum
```

## Requirements

- `typescript@>=5.0.0`
- `tsconfig.json > "compilerOptions" > { "strict": true }`

# Usage

```ts
import { Enum } from "unenum";
```

```ts
export type Light = typeof $Light;
export const [Light, $Light] = Enum.define(
  {} as {
    On: { intensity: number };
    Off: true;
  },
);
```

```ts
Light.On({ intensity: 100 });
Light.Off();

// or manually instantiated with type ...
const light: Light = { _type: "On", intensity: 100 };
```

```ts
export function Light_isOn(light: Light): boolean {
  return Enum.match(light, "On");
}

export function Light_formatState(light: Light): string {
  return Enum.switch(light, {
    On: ({ intensity }) => `Currently on with intensity: ${intensity}.`,
    Off: "Currently off.",
  });
}
```

## with a mapper

<details>
<summary>Example</summary>

```ts
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
```

```ts
Location.Unknown();
Location.Known(-33.852, 151.21);

// or manually instantiated with type ...
const location: Location = { _type: "Known", lat: -33.852, lng: 151.21 };
```

</details>

## with a custom discriminant

<details>
<summary>Example</summary>

```ts
type File = typeof $File;
const [File, $File] = Enum.on("mime").define(
  {} as {
    "text/plain": { data: string };
    "image/jpeg": { data: Buffer };
    "application/json": { data: unknown };
  },
);
```

```ts
File["text/plain"]({ data: "..." });
File["image/jpeg"]({ data: Buffer.from([]) });
File["application/json"]({ data: { items: [1, 2, 3] } });

// or manually instantiated with type ...
const file: File = { mime: "text/plain", data: "..." };
```

</details>

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

## `Enum`

```
Enum<TVariants, TDiscriminant?>
```

> [!NOTE]
> Recommend that you use [`Enum.define`](#enumdefine) instead of
[`Enum`](#enum) directly.

- Creates a discriminated union `type` from a key-value map of variants.
- Use `true` for unit variants that don't have any data properties (not `{}`).

#### Using the default discriminant

```ts
export type Default = Enum<{
  UnitVariant: true;
  DataVariant: { value: string };
}>;

const example_unit: Default = { _type: "UnitVariant" };
const example_data: Default = { _type: "DataVariant", value: "..." };
```

#### Using a custom discriminant

```ts
export type Custom = Enum<
  {
    UnitVariant: true;
    DataVariant: { value: string };
  },
  "kind"
>;

const custom_unit: Custom = { kind: "UnitVariant" };
const custom_data: Custom = { kind: "DataVariant", value: "..." };
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.define`

```
Enum.define(variants, options?) => [builder, type]

options.discriminant = string
options.mapper = { [variant]: callback }
```

#### Examples

- [Usage](#usage)
- [Usage with a mapper](#with-a-mapper)
- [Usage with a custom discriminant](#with-a-custom-discriminant)

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.match`

```
Enum.match(value, variant | variants[]) => boolean
```

#### Match with one variant

```ts
const getLightIntensity = (light: Light): number | undefined => {
  if (Enum.match(light, "On")) {
    return light.intensity;
  }
  return undefined;
};
```

#### Match with many variants

```ts
const getFileFormat = (file: File): "text" | "image" => {
  if (Enum.on("mime").match(file, ["text/plain", "application/json"])) {
    return "text";
  }
  return "image";
};
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.switch`

```
Enum.switch(value, matcher) => inferred

matcher[variant]: value | callback
matcher._: value | callback
```

#### Handle all cases

```ts
const formatLightState = (light: Light) =>
  Enum.switch(light, {
    On: ({ intensity }) => `On(${intensity})`,
    Off: "Off",
  });
```

#### Unhandled cases with fallback

```ts
const onFileSelect = (file: File) =>
  Enum.on("mime").switch(file, {
    "image/jpeg": () => prompt("Name for image:"),
    _: () => alert("Unsupported filetype."),
  });
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.on`

```
Enum.on(discriminant) => { define, match, switch }
```

- Redefines and returns all `Enum.*` methods with a given custom discriminant.

#### Examples

- [Usage with a custom discriminant](#with-a-custom-discriminant)

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Result`

```
Result<TOk?, TError?>
```

```ts
import { Result } from "unenum";
```

#### Result without any values

```ts
export function getResult(): Result {
  if (Math.random()) {
    return Result.Error();
  }
  return Result.Ok();
}
```

#### Result with Ok and Error values

```ts
export function queryFile(): Result<File, "NotFound"> {
  if (Math.random()) {
    return Result.Error("NotFound");
  }
  const file = File["text/plain"]({ data: "..." });
  return Result.Ok(file);
}

const fileOrUndefined = queryFile().value;
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Result.Ok`

```
Result.Ok(value | value?) => Result.Ok<inferred>
Result.Ok<TOk?>
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Result.Error`

```
Result.Error(error | error?) => Result.Error<inferred>
Result.Error<TError?>
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Result.from`

```
Result.from(callback)
```

- Executes the callback within a `try`/`catch`:
  - returns a `Result.Ok` with the callback's result,
  - otherwise a `Result.Error` with the thrown error (if any).

```ts
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
```

<div align=right><a href=#api>Back to top ⤴</a></div>

# `Enum` Type Utilities

```ts
// example
type Signal = Enum<{ Red: true; Yellow: true; Green: true }>;
```

<br/>

## `Enum.Root`
- Infers a key/value mapping of an Enum's variants.

```ts
export type Root = Enum.Root<Signal>;
// -> { Red: true, Yellow: true; Green: true }
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Keys`
- Infers all keys of an Enum's variants.

```ts
export type Keys = Enum.Keys<Signal>;
// -> "Red" | "Yellow" | "Green"
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Pick`
- Pick subset of an Enum's variants by key.

```ts
export type PickRed = Enum.Pick<Signal, "Red">;
// -> *Red

export type PickRedYellow = Enum.Pick<Signal, "Red" | "Yellow">;
// -> *Red | *Yellow
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Omit`
- Omit subset of an Enum's variants by key.

```ts
export type OmitRed = Enum.Omit<Signal, "Red">;
// -> *Yellow | *Green

export type OmitRedYellow = Enum.Omit<Signal, "Red" | "Yellow">;
// -> *Green
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Extend`
- Add new variants and merge new properties for existing variants for an Enum.

```ts
export type Extend = Enum.Extend<Signal, { Flashing: true }>;
// -> *Red | *Yellow | *Green | *Flashing
```

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Merge`
- Merge all variants and properties of all given Enums.

```ts
export type Merge = Enum.Merge<Enum<{ Left: true }> | Enum<{ Right: true }>>;
// -> *Left | *Right
```

<div align=right><a href=#api>Back to top ⤴</a></div>
