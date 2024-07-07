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


<details open><summary>(<strong>Example</strong>) Defining.</summary>

```ts
export type Light = Enum.infer<typeof Light>;
export const Light = Enum.define(
  {} as {
    On: { intensity: number };
    Off: true;
  },
);
```

</details>

<details open><summary>(<strong>Example</strong>) Instantiating.</summary>

```ts
Light.On({ intensity: 100 });
Light.Off();

// or manually instantiated with type ...
const light: Light = { _type: "On", intensity: 100 };
```

</details>

<details open><summary>(<strong>Example</strong>) Typing, Matching, Switching.</summary>

```ts
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
```

</details>

<details><summary>(<strong>Example</strong>) Using a mapper.</summary>

```ts
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
```


```ts
Location.Unknown();
Location.Known(-33.852, 151.21);

// or manually instantiated with type ...
const location: Location = { _type: "Known", lat: -33.852, lng: 151.21 };
```

</details>

<details><summary>(<strong>Example</strong>) Using a custom discriminant.</summary>

```ts
type File = Enum.infer<typeof File>;
const File = Enum.on("mime").define(
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
  - [`Enum.infer`](#enuminfer)
  - [`Enum.match`](#enummatch)
  - [`Enum.switch`](#enumswitch)
  - [`Enum.from`](#enumfrom)
  - [`Enum.on`](#enumon)
- Primitives
  - [`Enum.Value`](#enumvalue)
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

<details><summary>(<strong>Example</strong>) Using the default discriminant.</summary>

```ts
export type Default = Enum<{
  UnitVariant: true;
  DataVariant: { value: string };
}>;

const unit: Default = { _type: "UnitVariant" };
const data: Default = { _type: "DataVariant", value: "..." };
```

</details>

<details><summary>(<strong>Example</strong>) Using a custom discriminant.</summary>

```ts
export type Custom = Enum<
  {
    UnitVariant: true;
    DataVariant: { value: string };
  },
  "kind"
>;

const unitCustom: Custom = { kind: "UnitVariant" };
const dataCustom: Custom = { kind: "DataVariant", value: "..." };
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.define`

```
(func) Enum.define(variants, options?: { [variant]: callback }) => builder
```

- See [#usage](#usage) for example.

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.infer`

```
(type) Enum.infer<TBuilder>
```

- See [#usage](#usage) for example.

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.match`

```
(func) Enum.match(value, variant | variants[]) => boolean
```

<details><summary>(<strong>Example</strong>) Match with one variant.</summary>

```ts
const getLightIntensity = (light: Light): number | undefined => {
  if (Enum.match(light, "On")) {
    return light.intensity;
  }
  return undefined;
};
```

</details>

<details><summary>(<strong>Example</strong>) Match with many variants.</summary>

```ts
const getFileFormat = (file: File): "text" | "image" => {
  if (Enum.on("mime").match(file, ["text/plain", "application/json"])) {
    return "text";
  }
  return "image";
};
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.switch`

```
(func) Enum.switch(
  value,
  matcher = { [variant]: value | callback; _?: value | callback }
) => inferred
```

<details><summary>(<strong>Example</strong>) Handle all cases.</summary>

```ts
const formatLightState = (light: Light) =>
  Enum.switch(light, {
    On: ({ intensity }) => `On(${intensity})`,
    Off: "Off",
  });
```

</details>

<details><summary>(<strong>Example</strong>) Unhandled cases with fallback.</summary>

```ts
const onFileSelect = (file: File) =>
  Enum.on("mime").switch(file, {
    "image/jpeg": () => prompt("Name for image:"),
    _: () => alert("Unsupported filetype."),
  });
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.from`

```
(func) Enum.from(variantName, variantProperties?) => inferred
```

- Useful if you add an additional Enum variant but don't have (or want to
define) a Enum builder for it.

<details><summary>(<strong>Example</strong>) Create an Enum value instance from any return type.</summary>

```ts
function getOutput():
  | Enum.Loading
  | Enum<{ None: true; Some: { value: unknown } }> {
  if (branch()) return Enum.from("None");
  if (branch()) return Enum.from("Some", { value: "..." });
  if (branch()) return Enum.from("Loading");
  return Enum.Loading();
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.on`

```
(func) Enum.on(discriminant) => { define, match, switch }
```

- Redefines and returns all `Enum.*` runtime methods with a custom discriminant.

<details><summary>(<strong>Example</strong>) Define and use an Enum with a custom discriminant.</summary>

```ts
type Foo = Enum.infer<typeof Foo>;
const Foo = Enum.on("kind").define({} as { A: true; B: true });

const value = Foo.A() as Foo;
Enum.on("kind").match(value, "A");
Enum.on("kind").switch(value, { A: "A Variant", _: "Other Variant" });
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

# Primitives

## `Enum.Value`

```
(type) Enum.Value<TValue?>
(func) Enum.Value(inferred) => Enum.Value<inferred>
```

- Represents a normal/success value, `{ _type: "Value"; value: "..." }`.

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Error`

```
(type) Enum.Error<TError?>
(func) Enum.Error(inferred, cause?) => Enum.Error<inferred>
```

- Represents an error/failure value, `{ _type: "Error"; error: "..."; cause?: ... }`.

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Result`

```
(type) Enum.Result<TValue?, TError?>
```

- A helper alias for `Enum.Value | Enum.Error`.

> [!NOTE]
> This "Errors As Values" pattern allows known error cases to handled in a
type-safe way, as opposed to `throw`ing errors and relying on the caller to
remember to wrap it in `try`/`catch`.

<details><summary>(<strong>Example</strong>) Enum.Result without any values.</summary>

```ts
export function getResult(): Enum.Result {
  const isValid = Math.random();

  if (!isValid) {
    return Enum.Error();
  }

  return Enum.Value();
}
```

</details>

<details><summary>(<strong>Example</strong>) Enum.Result with Value and Error values.</summary>

```ts
export function queryFile(): Enum.Result<File, "NotFound"> {
  const fileOrUndefined = getFile();

  if (fileOrUndefined) {
    return Enum.Error("NotFound");
  }

  return Enum.Value(file);
}
```

</details>

<br />

```
(func) Enum.Result(callback)
```

- Executes the callback within a `try`/`catch`:
  - returns a `Enum.Value` with the callback's result,
  - otherwise a `Enum.Error` with the thrown error (if any).

<details><summary>(<strong>Example</strong>) Wrap a function that may throw.</summary>

```ts
const fetchResult = await Enum.Result(() => fetch("/api/whoami"));

Enum.switch(fetchResult, {
  Value: async ({ value: response }) => {
    const body = (await response.json()) as unknown;
    console.log(body);
  },
  Error: ({ error }) => {
    console.error(error);
  },
});
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.unwrapValue`

```
(func) Enum.unwrapValue(result) => value | undefined
```

- Helper to extract `value` of the `Value` variant, otherwise returning
`undefined` (e.g. in the case of an `Error`).
- Equivalent to `Enum.match(result, "Ok") ? result.value : undefined`.

> [!NOTE]
> Prefer using `Enum.match(result, "Error"))` with the "Early Return" pattern
to handle errors by
[type-narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
instead of using `Enum.unwrapValue(result)` to check for `undefined`.

<details><summary>(<strong>Example</strong>) Safely wrap throwable function call, then unwrap the value or use a fallback.</summary>

```ts
const result = Enum.Result(() => JSON.stringify("..."));
const valueOrFallback = Enum.unwrapValue(result) ?? "null";
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Loading`

```
(type) Enum.Loading
(func) Enum.Loading() => Enum.Loading
```

- Represents an loading state.
- Ideal for states' values or stateful functions (like React hooks).

<details><summary>(<strong>Example</strong>) React hook that returns a value, error, or loading state.</summary>

```ts
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

  return Enum.Value(data.gqlListItems.items);
}
```

</details>

<details><summary>(<strong>Example</strong>) React state that could be a loaded value, error, or loading state.</summary>

```ts
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

      setState(Enum.Value({ items: responseResult.value.items }));
      return;
    })();
  }, []);

  // exhaustively handle all possible states
  return Enum.switch(state, {
    Loading: () => `<Spinner />`,
    Value: ({ value: { items } }) => `<ul>${items.map(() => `<li />`)}</ul>`,
    Error: ({ error }) => `<span>A ${error} error has occurred.</span>`,
  });
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

# Utilities


```ts
// example
type Signal = Enum<{ Red: true; Yellow: true; Green: true }>;
```


## `Enum.Root`

```
(type) Enum.Root<TEnum, TDiscriminant?>
```

<details><summary>(<strong>Example</strong>) Infer a key/value mapping of an Enum's variants.</summary>

```ts
export type Root = Enum.Root<Signal>;
// -> { Red: true, Yellow: true; Green: true }
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Keys`

```
(type) Enum.Keys<TEnum, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Infers all keys of an Enum's variants.</summary>

```ts
export type Keys = Enum.Keys<Signal>;
// -> "Red" | "Yellow" | "Green"
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Pick`

```
(type) Enum.Pick<TEnum, TKeys, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Pick subset of an Enum's variants by key.</summary>

```ts
export type PickRed = Enum.Pick<Signal, "Red">;
// -> *Red

export type PickRedYellow = Enum.Pick<Signal, "Red" | "Yellow">;
// -> *Red | *Yellow
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Omit`

```
(type) Enum.Omit<TEnum, TKeys, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Omit subset of an Enum's variants by key.</summary>

```ts
export type OmitRed = Enum.Omit<Signal, "Red">;
// -> *Yellow | *Green

export type OmitRedYellow = Enum.Omit<Signal, "Red" | "Yellow">;
// -> *Green
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Extend`

```
(type) Enum.Extend<TEnum, TVariants, TDiscriminant?>
```

<details><summary>(<strong>Example</strong>) Add new variants and merge new properties for existing variants for an Enum.</summary>

```ts
export type Extend = Enum.Extend<Signal, { Flashing: true }>;
// -> *Red | *Yellow | *Green | *Flashing
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Merge`

```
(type) Enum.Merge<TEnums, TDiscriminant?>
```

<details><summary>(<strong>Example</strong>) Merge all variants and properties of all given Enums.</summary>

```ts
export type Merge = Enum.Merge<Enum<{ Left: true }> | Enum<{ Right: true }>>;
// -> *Left | *Right
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>
