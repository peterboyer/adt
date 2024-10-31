
# Install

```shell
npm install unenum
```

## Requirements

- `typescript@>=5.0.0`
- `tsconfig.json > "compilerOptions" > { "strict": true }`

# Quickstart

`Enum` can create discriminated union types.


```ts
import { Enum } from "unenum";

type Post = Enum<{
  Ping: true;
  Text: { title?: string; body: string };
  Photo: { url: string };
}>;
```


... which is identical to if you declared it manually.


```ts
type Post =
  | { _type: "Ping" }
  | { _type: "Text"; title?: string; body: string }
  | { _type: "Photo"; url: string };
```


`Enum.define` can create discriminated union types and ease-of-use constructors.


```ts
const Post = Enum.define(
  {} as {
    Ping: true;
    Text: { title?: string; body: string };
    Photo: { url: string };
  },
);

type Post = Enum.define<typeof Post>;
```


Constructors can create Enum variant values:
- All constructed Enum variant values are plain objects.
- They match their variant types exactly.
- They do not have any methods or hidden properties.


```ts
const posts: Post[] = [
  Post.Ping(),
  Post.Text({ body: "Hello, World!" }),
  Post.Photo({ url: "https://example.com/image.jpg" }),
];
```


The `Enum` provides ease-of-use utilities like `.switch` and `.match` for
working with discriminated unions.


```ts
(function (post: Post): string {
  if (Enum.match(post, "Ping")) {
    return "Ping!";
  }

  return Enum.switch(post, {
    Text: ({ title }) => `Text("${title ?? "Untitled"}")`,
    _: () => `Unhandled`,
  });
});
```


Enum variant values are simple objects, you can narrow and access properties as
you would any other object.


```ts
function getTitleFromPost(post: Post): string | undefined {
  return post._type === "Text" ? post.title : undefined;
}
```


<details><summary><code>Enum</code> supports creating discriminated unions with custom discriminants. <small>(Click for details…)</small></summary>
<br />


```ts
type File = Enum<
  {
    "text/plain": { data: string };
    "image/jpeg": { data: Buffer };
    "application/json": { data: unknown };
  },
  "mime"
>;
```


This creates a discriminated union identical to if you did so manually.


```ts
type File =
  | { mime: "text/plain"; data: string }
  | { mime: "image/jpeg"; data: Buffer }
  | { mime: "application/json"; data: unknown };
```


`Enum.*` methods for custom discriminants can be accessed via the `.on()` method.


```ts
const File = Enum.on("mime").define(
  {} as {
    "text/plain": { data: string };
    "image/jpeg": { data: Buffer };
    "application/json": { data: unknown };
  },
);

type File = Enum.define<typeof File>;

const files = [
  File["text/plain"]({ data: "..." }),
  File["image/jpeg"]({ data: Buffer.from("...") }),
  File["application/json"]({ data: {} }),
];

(function (file: File): string {
  if (Enum.on("mime").match(file, "text/plain")) {
    return "Text!";
  }

  return Enum.on("mime").switch(file, {
    "image/jpeg": ({ data }) => `Image(${data.length})`,
    _: () => `Unhandled`,
  });
});
```


</details>

---

# API

- [`Enum`](#enum)
  - [`Enum.define`](#enumdefine)
  - [`Enum.match`](#enummatch)
  - [`Enum.switch`](#enumswitch)
  - [`Enum.value`](#enumvalue)
  - [`Enum.unwrap`](#enumunwrap)
  - [`Enum.on`](#enumon)
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

<details><summary>(<strong>Example</strong>) Using the default discriminant.</summary>

```ts
type Foo = Enum<{
  Unit: true;
  Data: { value: string };
}>;
```

</details>

<details><summary>(<strong>Example</strong>) Using a custom discriminant.</summary>

```ts
type Foo = Enum<
  {
    Unit: true;
    Data: { value: string };
  },
  "custom"
>;
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.define`

```
(func) Enum.define(variants, options?: { [variant]: callback }) => builder
```


```ts
const Foo = Enum.define(
  {} as {
    Unit: true;
    Data: { value: string };
  },
);

type Foo = Enum.define<typeof Foo>;
```


<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.match`

```
(func) Enum.match(value, variant | variants[]) => boolean
```

<details><summary>(<strong>Example</strong>) Match with one variant.</summary>

```ts
const foo = Foo.Unit() as Foo;
const value = Enum.match(foo, "Unit");
```

</details>

<details><summary>(<strong>Example</strong>) Match with many variants.</summary>

```ts
function getFileFormat(file: File): boolean {
  const isText = Enum.on("mime").match(file, [
    "text/plain",
    "application/json",
  ]);
  return isText;
}
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
const foo: Foo = Foo.Unit() as Foo;
const value = Enum.switch(foo, {
  Unit: "Unit()",
  Data: ({ value }) => `Data(${value})`,
});
```

</details>

<details><summary>(<strong>Example</strong>) Unhandled cases with fallback.</summary>

```ts
const foo: Foo = Foo.Unit() as Foo;
const value = Enum.switch(foo, {
  Unit: "Unit()",
  _: "Unknown",
});
```

</details>
//
<details><summary>(<strong>Example</strong>) UI Framework (e.g. React) rendering all state cases.</summary>

```ts
const State = Enum.define(
  {} as {
    Pending: true;
    Ok: { items: string[] };
    Error: { cause: Error };
  },
);

type State = Enum.define<typeof State>;

function Component(): Element {
  const [state, setState] = useState<State>(State.Pending());

  // fetch data and exclusively handle success or error states
  useEffect(() => {
    (async () => {
      const responseResult = await fetch("/items")
        .then((response) => response.json() as Promise<{ items: string[] }>)
        .catch((cause) =>
          cause instanceof Error ? cause : new Error(undefined, { cause }),
        );

      setState(
        responseResult instanceof Error
          ? State.Error({ cause: responseResult })
          : State.Ok({ items: responseResult.items }),
      );
    })();
  }, []);

  // exhaustively handle all possible states
  return Enum.switch(state, {
    Loading: () => `<Spinner />`,
    Ok: ({ items }) => `<ul>${items.map(() => `<li />`)}</ul>`,
    Error: ({ cause }) => `<span>Error: "${cause.message}"</span>`,
  });
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.value`

```
(func) Enum.value(variantName, variantProperties?) => inferred
```

- Useful if you add an additional Enum variant but don't have (or want to
define) a Enum builder for it.

<details><summary>(<strong>Example</strong>) Create an Enum value instance, (if possible) inferred from return type.</summary>

```ts

function getOutput(): Enum<{
  None: true;
  Some: { value: unknown };
  All: true;
}> {
  if (Math.random()) return Enum.value("All");
  if (Math.random()) return Enum.value("Some", { value: "..." });
  return Enum.value("None");
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.unwrap`

```
(func) Enum.unwrap(result, path) => inferred | undefined
```

- Extract a value's variant's property using a `"{VariantName}.{PropertyName}"`
path, otherwise returns `undefined`.

<details><summary>(<strong>Example</strong>) Safely wrap throwable function call, then unwrap the Ok variant's value or use a fallback.</summary>

```ts
const value = { _type: "A", foo: "..." } as Enum<{
  A: { foo: string };
  B: { bar: number };
}>;
const valueOrFallback = Enum.unwrap(value, "A.foo") ?? null;
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.on`

```
(func) Enum.on(discriminant) => { define, match, value, unwrap }
```

- Redefines and returns all `Enum.*` runtime methods with a custom discriminant.

<details><summary>(<strong>Example</strong>) Define and use an Enum with a custom discriminant.</summary>

```ts
const Foo = Enum.on("kind").define({} as { A: true; B: true });
type Foo = Enum.define<typeof Foo>;

const value = Foo.A() as Foo;
Enum.on("kind").match(value, "A");
Enum.on("kind").switch(value, { A: "A Variant", _: "Other Variant" });
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Root`

```
(type) Enum.Root<TEnum, TDiscriminant?>
```

<details><summary>(<strong>Example</strong>) Infer a key/value mapping of an Enum's variants.</summary>

```ts
export type Root = Enum.Root<Enum<{ Unit: true; Data: { value: string } }>>;
// -> { Unit: true; Data: { value: string } }
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Keys`

```
(type) Enum.Keys<TEnum, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Infers all keys of an Enum's variants.</summary>

```ts
export type Keys = Enum.Keys<Enum<{ Unit: true; Data: { value: string } }>>;
// -> "Unit" | "Data"
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Pick`

```
(type) Enum.Pick<TEnum, TKeys, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Pick subset of an Enum's variants by key.</summary>

```ts
export type Pick = Enum.Pick<
  Enum<{ Unit: true; Data: { value: string } }>,
  "Unit"
>;
// -> { _type: "Unit" }
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.Omit`

```
(type) Enum.Omit<TEnum, TKeys, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Omit subset of an Enum's variants by key.</summary>

```ts
export type Omit = Enum.Omit<
  Enum<{ Unit: true; Data: { value: string } }>,
  "Unit"
>;
// -> *Data

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
export type Extend = Enum.Extend<
  Enum<{ Unit: true; Data: { value: string } }>,
  { Extra: true }
>;
// -> *Unit | *Data | *Extra
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

---
