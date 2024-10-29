
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


The `Enum` provides ease-of-use utilities like `.match` for working with
discriminated unions.


```ts
(function (post: Post): string {
  if (Enum.match(post, "Ping")) {
    return "Ping!";
  }

  return Enum.match(post, {
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

  return Enum.on("mime").match(file, {
    "image/jpeg": ({ data }) => `Image(${data.length})`,
    _: () => `Unhandled`,
  });
});
```


</details>

---

`Result` creates a discriminated union with an `Ok` and `Error` variant.


```ts
import { Result } from "unenum";

export async function getUserCountFromDatabase(): Promise<
  Result<number, "DatabaseError">
> {
  const queriedCount = await Promise.resolve(1);
  return Result.Ok(queriedCount);
}
```


... which is identical to if you declared it manually.


```ts
export async function getUserCountFromDatabase(): Promise<
  { _type: "Ok"; value: number } | { _type: "Error"; error: "DatabaseError" }
> {
  const queriedCount = await Promise.resolve(1);
  return { _type: "Ok", value: queriedCount };
}
```


`Result.from` calls a given callback that could `throw` and returns a `Result`
variant value:
- `Result.Ok` with the callback's return value,
- `Result.Error` with the callback's thrown error as a value.


```ts
export async function getUserCountFromDatabase(): Promise<
  Result<number, "DatabaseError">
> {
  // Database query "throws" if database is unreachable or query fails.
  const $queriedCount = await Result.from(() => queryDatabaseUserCount());

  // Handle error, forward cause.
  if (Enum.match($queriedCount, "Error")) {
    return Result.Error("DatabaseError", $queriedCount);
  }

  return Result.Ok($queriedCount.value);
}
```


<details><summary>Real-world example. <small>(Click for details…)</small></summary>
<br />


```ts
export function getTokens(): Tokens | undefined {
  // Retrieve a JSON string to be parsed.
  const tokensSerialised = window.localStorage.getItem("tokens") ?? undefined;
  if (!tokensSerialised) {
    return undefined;
  }

  // JSON.parse "throws" if given an invalid JSON string.
  const $tokensUnknown = Result.from(() => JSON.parse(tokensSerialised));
  if (Enum.match($tokensUnknown, "Error")) {
    return undefined;
  }

  // Tokens.parse "throws" if given a value that doesn't match the schema.
  const $tokens = Result.from(() => Tokens.parse($tokensUnknown.value));
  if (Enum.match($tokens, "Error")) {
    return undefined;
  }

  return $tokens.value;
}

import { z } from "zod";
const Tokens = z.object({ accessToken: z.string(), refreshToken: z.string() });
type Tokens = z.infer<typeof Tokens>;
```


</details>

---

# API

- [`Enum`](#enum)
  - [`Enum.define`](#enumdefine)
  - [`Enum.match`](#enummatch)
  - [`Enum.value`](#enumvalue)
  - [`Enum.unwrap`](#enumunwrap)
  - [`Enum.on`](#enumon)
  - [`Enum.Root`](#enumroot)
  - [`Enum.Keys`](#enumkeys)
  - [`Enum.Pick`](#enumpick)
  - [`Enum.Omit`](#enumomit)
  - [`Enum.Extend`](#enumextend)
  - [`Enum.Merge`](#enummerge)
- [`Result`](#result)
  - [`Result.Ok`](#resultok)
  - [`Result.Error`](#resulterror)
- [`Pending`](#pending)

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
(func) Enum.match(value, matcher = { [variant]: value | callback; _?: value | callback }) => inferred
```

<details><summary>(<strong>Example</strong>) Narrow with one variant.</summary>

```ts
const foo = Foo.Unit() as Foo;
const value = Enum.match(foo, "Unit");
```

</details>

<details><summary>(<strong>Example</strong>) Narrow with many variants.</summary>

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

<details><summary>(<strong>Example</strong>) Handle all cases.</summary>

```ts
const foo: Foo = Foo.Unit() as Foo;
const value = Enum.match(foo, {
  Unit: "Unit()",
  Data: ({ value }) => `Data(${value})`,
});
```

</details>

<details><summary>(<strong>Example</strong>) Unhandled cases with fallback.</summary>

```ts
const foo: Foo = Foo.Unit() as Foo;
const value = Enum.match(foo, {
  Unit: "Unit()",
  _: "Unknown",
});
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
const result = Result.from(() => JSON.stringify("..."));
const valueOrFallback = Enum.unwrap(result, "Ok.value") ?? null;
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Enum.on`

```
(func) Enum.on(discriminant) => { define, match, switch, value, unwrap }
```

- Redefines and returns all `Enum.*` runtime methods with a custom discriminant.

<details><summary>(<strong>Example</strong>) Define and use an Enum with a custom discriminant.</summary>

```ts
const Foo = Enum.on("kind").define({} as { A: true; B: true });
type Foo = Enum.define<typeof Foo>;

const value = Foo.A() as Foo;
Enum.on("kind").match(value, "A");
Enum.on("kind").match(value, { A: "A Variant", _: "Other Variant" });
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

## `Result`

```
(type) Result<TOk?, TError?>
```

- A helper alias for `Result.Ok | Result.Error`.

> [!NOTE]
> This "Errors As Values" pattern allows known error cases to handled in a
type-safe way, as opposed to `throw`ing errors and relying on the caller to
remember to wrap it in `try`/`catch`.

<details><summary>(<strong>Example</strong>) Result without any values.</summary>

```ts
export function getResult(): Result {
  const isValid = Math.random();

  if (!isValid) {
    return Result.Error();
  }

  return Result.Ok();
}
```

</details>

<details><summary>(<strong>Example</strong>) Result with Ok and Error values.</summary>

```ts
export function queryFile(): Result<File, "NotFound"> {
  const fileOrUndefined = getFile();

  if (fileOrUndefined) {
    return Result.Error("NotFound");
  }

  return Result.Ok(file);
}
```

</details>

## `Result.Ok`

```
(type) Enum.Ok<TOk?>
(func) Enum.Ok(inferred) => Enum.Ok<inferred>
```

- Represents a normal/success value, `{ _type: "Ok"; value: "..." }`.

<div align=right><a href=#api>Back to top ⤴</a></div>

## `Result.Error`

```
(type) Enum.Error<TError?>
(func) Enum.Error(inferred, cause?) => Enum.Error<inferred>
```

- Represents an error/failure value, `{ _type: "Error"; error: "..."; cause?: ... }`.

<div align=right><a href=#api>Back to top ⤴</a></div>

```
(func) Result.from(callback)
```

- Executes the callback within a `try`/`catch`:
  - returns a `Enum.Ok` with the callback's result,
  - otherwise a `Enum.Error` with the thrown error (if any).

<details><summary>(<strong>Example</strong>) Wrap a function that may throw.</summary>

```ts
const fetchResult = await Result.from(() => fetch("/api/whoami"));

Enum.match(fetchResult, {
  Ok: async ({ value: response }) => {
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

---

## `Pending`

```
(type) Pending
(func) Pending() => Pending
```

- Represents an pending state.
- Ideal for states' values or stateful functions (like React hooks).

<details><summary>(<strong>Example</strong>) React hook that returns a value, error, or pending state.</summary>

```ts
import { Pending } from "unenum";

function useFetchedListItems(): Result<string[], "NetworkError"> | Pending {
  const { data, error, loading } = useQuery(gqlListItems);

  if (loading) {
    return Pending();
  }

  if (error || !data) {
    return Result.Error("NetworkError");
  }

  return Result.Ok(data.gqlListItems.items);
}
```

</details>

<details><summary>(<strong>Example</strong>) React state that could be a loaded value, error, or loading state.</summary>

```ts
function Component(): Element {
  const [state, setState] = useState<
    Result<{ items: string[] }, "NetworkError"> | Pending
  >(Pending());

  // fetch data and exclusively handle success or error states
  useEffect(() => {
    (async () => {
      const responseResult = await Result.from(() =>
        fetch("/items").then(
          (response) => response.json() as Promise<{ items: string[] }>,
        ),
      );

      if (Enum.match(responseResult, "Error")) {
        setState(Result.Error("NetworkError"));
        return;
      }

      setState(Result.Ok({ items: responseResult.value.items }));
      return;
    })();
  }, []);

  // exhaustively handle all possible states
  return Enum.match(state, {
    Loading: () => `<Spinner />`,
    Ok: ({ value: { items } }) => `<ul>${items.map(() => `<li />`)}</ul>`,
    Error: ({ error }) => `<span>A ${error} error has occurred.</span>`,
  });
}
```

</details>

<div align=right><a href=#api>Back to top ⤴</a></div>
