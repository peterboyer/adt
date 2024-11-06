
# Install

```shell
npm install pb.adt
```

## Requirements

- `typescript@>=5.0.0`
- `tsconfig.json > "compilerOptions" > { "strict": true }`

# Quickstart

`ADT` can create discriminated union types.


```ts
import { ADT } from "pb.adt";

type Post = ADT<{
  Ping: true;
  Text: { title?: string; body: string };
  Photo: { url: string };
}>;
```


... which is identical to if you declared it manually.


```ts
type Post =
  | { $type: "Ping" }
  | { $type: "Text"; title?: string; body: string }
  | { $type: "Photo"; url: string };
```


`ADT.define` can create discriminated union types and ease-of-use constructors.


```ts
const Post = ADT.define(
  {} as {
    Ping: true;
    Text: { title?: string; body: string };
    Photo: { url: string };
  },
);

type Post = ADT.define<typeof Post>;
```


Constructors can create ADT variant values:
- All constructed ADT variant values are plain objects.
- They match their variant types exactly.
- They do not have any methods or hidden properties.


```ts
const posts: Post[] = [
  Post.Ping(),
  Post.Text({ body: "Hello, World!" }),
  Post.Photo({ url: "https://example.com/image.jpg" }),
];
```


The `ADT` provides ease-of-use utilities like `.switch` and `.match` for
working with discriminated unions.


```ts
(function (post: Post): string {
  if (ADT.match(post, "Ping")) {
    return "Ping!";
  }

  return ADT.switch(post, {
    Text: ({ title }) => `Text("${title ?? "Untitled"}")`,
    _: () => `Unhandled`,
  });
});
```


`ADT` variant values are simple objects, you can narrow and access properties as
you would any other object.


```ts
function getTitleFromPost(post: Post): string | undefined {
  return post.$type === "Text" ? post.title : undefined;
}
```


<details><summary><code>ADT</code> supports creating discriminated unions with custom discriminants. <small>(Click for details…)</small></summary>
<br />


```ts
type File = ADT<
  {
    "text/plain": { data: string };
    "image/jpeg": { data: ImageBitmap };
    "application/json": { data: unknown };
  },
  "mime"
>;
```


This creates a discriminated union identical to if you did so manually.


```ts
type File =
  | { mime: "text/plain"; data: string }
  | { mime: "image/jpeg"; data: ImageBitmap }
  | { mime: "application/json"; data: unknown };
```


`ADT.*` methods for custom discriminants can be accessed via the `.on()` method.


```ts
const File = ADT.on("mime").define(
  {} as {
    "text/plain": { data: string };
    "image/jpeg": { data: ImageBitmap };
    "application/json": { data: unknown };
  },
);

type File = ADT.define<typeof File>;

const files = [
  File["text/plain"]({ data: "..." }),
  File["image/jpeg"]({ data: new ImageBitmap() }),
  File["application/json"]({ data: {} }),
];

(function (file: File): string {
  if (ADT.on("mime").match(file, "text/plain")) {
    return "Text!";
  }

  return ADT.on("mime").switch(file, {
    "image/jpeg": ({ data }) => `Image(${data})`,
    _: () => `Unhandled`,
  });
});
```


</details>

---

# API

- [`ADT`](#adt)
  - [`ADT.define`](#adtdefine)
  - [`ADT.match`](#adtmatch)
  - [`ADT.switch`](#adtswitch)
  - [`ADT.value`](#adtvalue)
  - [`ADT.unwrap`](#adtunwrap)
  - [`ADT.on`](#adton)
  - [`ADT.Root`](#adtroot)
  - [`ADT.Keys`](#adtkeys)
  - [`ADT.Pick`](#adtpick)
  - [`ADT.Omit`](#adtomit)
  - [`ADT.Extend`](#adtextend)
  - [`ADT.Merge`](#adtmerge)

## `ADT`

```
(type) ADT<TVariants, TDiscriminant?>
```

- Creates a discriminated union `type` from a key-value map of variants.
- Use `true` for unit variants that don't have any data properties ([not
`{}`](https://www.totaltypescript.com/the-empty-object-type-in-typescript)).

<details><summary>(<strong>Example</strong>) Using the default discriminant.</summary>

```ts
type Foo = ADT<{
  Unit: true;
  Data: { value: string };
}>;
```

</details>

<details><summary>(<strong>Example</strong>) Using a custom discriminant.</summary>

```ts
type Foo = ADT<
  {
    Unit: true;
    Data: { value: string };
  },
  "custom"
>;
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.define`

```
(func) ADT.define(variants, options?: { [variant]: callback }) => builder
```


```ts
const Foo = ADT.define(
  {} as {
    Unit: true;
    Data: { value: string };
  },
);

type Foo = ADT.define<typeof Foo>;
```


<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.match`

```
(func) ADT.match(value, variant | variants[]) => boolean
```

<details><summary>(<strong>Example</strong>) Match with one variant.</summary>

```ts
const foo = Foo.Unit() as Foo;
const value = ADT.match(foo, "Unit");
```

</details>

<details><summary>(<strong>Example</strong>) Match with many variants.</summary>

```ts
function getFileFormat(file: File): boolean {
  const isText = ADT.on("mime").match(file, ["text/plain", "application/json"]);
  return isText;
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.switch`

```
(func) ADT.switch(
  value,
  matcher = { [variant]: value | callback; _?: value | callback }
) => inferred
```

<details><summary>(<strong>Example</strong>) Handle all cases.</summary>

```ts
const foo: Foo = Foo.Unit() as Foo;
const value = ADT.switch(foo, {
  Unit: "Unit()",
  Data: ({ value }) => `Data(${value})`,
});
```

</details>

<details><summary>(<strong>Example</strong>) Unhandled cases with fallback.</summary>

```ts
const foo: Foo = Foo.Unit() as Foo;
const value = ADT.switch(foo, {
  Unit: "Unit()",
  _: "Unknown",
});
```

</details>
//
<details><summary>(<strong>Example</strong>) UI Framework (e.g. React) rendering all state cases.</summary>

```ts
const State = ADT.define(
  {} as {
    Pending: true;
    Ok: { items: string[] };
    Error: { cause: Error };
  },
);

type State = ADT.define<typeof State>;

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
  return ADT.switch(state, {
    Loading: () => `<Spinner />`,
    Ok: ({ items }) => `<ul>${items.map(() => `<li />`)}</ul>`,
    Error: ({ cause }) => `<span>Error: "${cause.message}"</span>`,
  });
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.value`

```
(func) ADT.value(variantName, variantProperties?) => inferred
```

- Useful if you add an additional ADT variant but don't have (or want to
define) a ADT builder for it.

<details><summary>(<strong>Example</strong>) Create an ADT value instance, (if possible) inferred from return type.</summary>

```ts

function getOutput(): ADT<{
  None: true;
  Some: { value: unknown };
  All: true;
}> {
  if (Math.random()) return ADT.value("All");
  if (Math.random()) return ADT.value("Some", { value: "..." });
  return ADT.value("None");
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.unwrap`

```
(func) ADT.unwrap(result, path) => inferred | undefined
```

- Extract a value's variant's property using a `"{VariantName}.{PropertyName}"`
path, otherwise returns `undefined`.

<details><summary>(<strong>Example</strong>) Safely wrap throwable function call, then unwrap the Ok variant's value or use a fallback.</summary>

```ts
const value = { $type: "A", foo: "..." } as ADT<{
  A: { foo: string };
  B: { bar: number };
}>;
const valueOrFallback = ADT.unwrap(value, "A.foo") ?? null;
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.on`

```
(func) ADT.on(discriminant) => { define, match, value, unwrap }
```

- Redefines and returns all `ADT.*` runtime methods with a custom discriminant.

<details><summary>(<strong>Example</strong>) Define and use an ADT with a custom discriminant.</summary>

```ts
const Foo = ADT.on("kind").define({} as { A: true; B: true });
type Foo = ADT.define<typeof Foo>;

const value = Foo.A() as Foo;
ADT.on("kind").match(value, "A");
ADT.on("kind").switch(value, { A: "A Variant", _: "Other Variant" });
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.Root`

```
(type) ADT.Root<Tadt, TDiscriminant?>
```

<details><summary>(<strong>Example</strong>) Infer a key/value mapping of an ADT's variants.</summary>

```ts
export type Root = ADT.Root<ADT<{ Unit: true; Data: { value: string } }>>;
// -> { Unit: true; Data: { value: string } }
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.Keys`

```
(type) ADT.Keys<Tadt, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Infers all keys of an ADT's variants.</summary>

```ts
export type Keys = ADT.Keys<ADT<{ Unit: true; Data: { value: string } }>>;
// -> "Unit" | "Data"
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.Pick`

```
(type) ADT.Pick<Tadt, TKeys, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Pick subset of an ADT's variants by key.</summary>

```ts
export type Pick = ADT.Pick<
  ADT<{ Unit: true; Data: { value: string } }>,
  "Unit"
>;
// -> { $type: "Unit" }
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.Omit`

```
(type) ADT.Omit<Tadt, TKeys, TDiscriminant?>
```
<details><summary>(<strong>Example</strong>) Omit subset of an ADT's variants by key.</summary>

```ts
export type Omit = ADT.Omit<
  ADT<{ Unit: true; Data: { value: string } }>,
  "Unit"
>;
// -> *Data

// -> *Green
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.Extend`

```
(type) ADT.Extend<Tadt, TVariants, TDiscriminant?>
```

<details><summary>(<strong>Example</strong>) Add new variants and merge new properties for existing variants for an ADT.</summary>

```ts
export type Extend = ADT.Extend<
  ADT<{ Unit: true; Data: { value: string } }>,
  { Extra: true }
>;
// -> *Unit | *Data | *Extra
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `ADT.Merge`

```
(type) ADT.Merge<Tadts, TDiscriminant?>
```

<details><summary>(<strong>Example</strong>) Merge all variants and properties of all given ADTs.</summary>

```ts
export type Merge = ADT.Merge<ADT<{ Left: true }> | ADT<{ Right: true }>>;
// -> *Left | *Right
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>
