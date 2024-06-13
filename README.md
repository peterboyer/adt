<div align="center">

# unenum

**Universal ADT utilities for TypeScript.**
</div>

```ts
import { type Enum, Result, builder, is, match } from "unenum";

// 1. define

export type Variant = Enum<{
  Valid: { id: string };
  Invalid: true;
}>;

export const Variant = builder({} as Variant);

// 2. return types and values

export function getVariant(): Result<Variant, "OutOfRangeError" | "ZeroError"> {
  const id = Math.random();

  if (id === 0) {
    return Result.Error("ZeroError");
  }

  if (id < 0) {
    return Result.Ok(Variant.Invalid());
  }

  return Result.Ok(Variant.Valid({ id: id.toString() }));
}

// 3. using values

const result = getVariant();

if (is(result, "Error")) {
  console.log(result.error);
} else {
  const variant = result.value;
  match(variant, {
    Valid: () => console.log("is valid"),
    Invalid: () => console.log("is invalid"),
  });
}
```

<div align="center">

[Installation](#installation) • [`Enum`](#enum) • [`builder`](#builder) •
[`is`](#is) • [`match`](#match) • [`Result`](#result) •
[`Result.from`](#resultfrom) • [`Async`](#async)

</div>

- produces simple and portable discriminated union types.
- all types can be compiled away, with zero-cost to bundle size.
- supports custom discriminants for type utilities and runtime helpers.
- includes `Result` to improve error-handling ergonomics.
- includes helpers to inspect/pick/omit/merge/extend Enums and variants.
- includes optional runtime helpers, `is`, `match` and `Result.from`.

Read more:
- [Tagged union](https://wikipedia.org/wiki/Tagged_union)
- [Algebraic data type](https://wikipedia.org/wiki/Algebraic_data_type)
- [Comparison of programming languages (algebraic data type)](https://wikipedia.org/wiki/Comparison_of_programming_languages_(algebraic_data_type))

## Installation

[![Version](https://img.shields.io/npm/v/unenum?label=npm)](https://www.npmjs.com/package/unenum/)
[![License](https://img.shields.io/npm/l/unenum)](./LICENSE)

```shell
npm install unenum
```

```shell
yarn add unenum
```

### Requirements

- `typescript@>=5.0.0`
- `tsconfig.json > "compilerOptions" > { "strict": true }`

## Playground
- This `README.ts` is a valid TypeScript file!

1. Clone this repo: `git clone git@github.com:peterboyer/unenum.git`.
2. Install development dependencies: `npm install` or `yarn install`.
3. Jump in and experiment!


## `Enum`

- The `_type` property is used as discriminant to distinguish between variants.
- The underscore-prefixed name somewhat denotes this as a special property not
  intended to collide with general-use user-space named properties.

```ts
export type User = Enum<{
  Anonymous: true;
  Authenticated: { userId: string };
}>;

// | { _type: "Anonymous" }
// | { _type: "Authenticated", userId: string }
```

### Instantiating an Enum

#### (a) builder function
- [`builder`](#builder) creates an Enum value "constructor" typed with a given
  Enum type.
- You may define and export the builder with the same name
as your Enum's type.

```ts
export const User = builder({} as User);

{
  const user: User = User.Anonymous();
  void user;

  void (() => User.Anonymous());
  void (() => User.Authenticated({ userId: "..." }));
}
```

#### (b) object expression
- Alternatively, you may chose to not use a builder.

```ts
{
  const user: User = { _type: "Anonymous" };
  void user;

  void ((): User => ({ _type: "Anonymous" }));
  void ((): User => ({ _type: "Authenticated", userId: "..." }));
}
```

### Using an Enum

#### (a.1) if statements, type-guard helper
- [`is`](#is) also allows for matching using an array of multiple variants' keys.

```ts
(function (user: User): string {
  if (is(user, "Authenticated")) {
    return `Logged in as ${user.userId}.`;
  }
  return "Not logged in.";
});
```

#### (a.2) if statements, property access
- Alternatively, you may chose to not use a matcher.

```ts
(function (user: User): string {
  if (user._type === "Authenticated") {
    return `Logged in as ${user.userId}.`;
  }
  return "Not logged in.";
});
```

#### (b.1) match helper, handling all cases
- [`match`](#match) allows easy type safe mapping of variants and variants'
  values to another returned value.

```ts
(function (user: User): string {
  return match(user, {
    Authenticated: ({ userId }) => `Logged in as ${userId}.`,
    Anonymous: "Not logged in.",
  });
});
```

#### (b.2) match helper, with catch-all

```ts
(function (user: User): string {
  return match(user, {
    Authenticated: ({ userId }) => `Logged in as ${userId}.`,
    _: "Unhandled case.",
  });
});
```

### `builder`
- Returns a constructor based on the given Enum type to easily create variant
  object values.
- A custom "mapper" can be used to define functions per Enum variant to
  streamline construction of Enum variants based on your use-cases.

```ts
type Colour = Enum<{
  Transparent: true;
  Named: { name: string };
  RGB: Record<"r" | "g" | "b", number>;
}>;

export const Colour = builder({} as Colour, {
  RGB: (r: number, g: number, b: number) => ({ r, g, b }),
});

{
  const color: Colour = Colour.RGB(4, 2, 0);
  void color;

  // variant with no properties
  void ((): Colour => Colour.Transparent());
  // variant with properties
  void ((): Colour => Colour.Named({ name: "Red" }));
  // variant with mapper function
  void ((): Colour => Colour.RGB(0, 0, 0));
}
```

### `is`
- Returns `true` and narrows the given Enum value's possible variants if the
  value matches any of the specified variants by key.

```ts
{
  type Value = Enum<{ A: true; B: { value: string } }>;
  const value = {} as Value;

  void (() => is(value, "A"));
  void (() => is(value, "B"));
  void (() => is(value, ["A"]));
  void (() => is(value, ["A", "B"]));
}
```

```ts
import { is_ } from "unenum";

{
  type Value = Enum<{ A: true; B: { value: string } }, "custom">;
  const value = {} as Value;

  void (() => is_(value, "custom", "A"));
  void (() => is_(value, "custom", "B"));
  void (() => is_(value, "custom", ["A"]));
  void (() => is_(value, "custom", ["A", "B"]));
}
```

### `match`
- The `matcher` object is keyed with all possible variants of the Enum and an
  optional `_` fallback case.
- If the `_` fallback case is not given, _all_ variants must be specified.
- All `matcher` cases (including `_`) can be a value or a callback.
- If a variant's case is a callback, the matching variants value's properties
  are available for access.

```ts
{
  const value = {} as Enum<{ A: true; B: { value: string } }>;

  void (() => match(value, { _: "Fallback" }));
  void (() => match(value, { _: () => "Fallback" }));
  void (() => match(value, { A: "A", _: "Fallback" }));
  void (() => match(value, { A: () => "A", _: "Fallback" }));
  void (() => match(value, { A: "A", B: "B" }));
  void (() => match(value, { A: "A", B: () => "B" }));
  void (() => match(value, { A: () => "A", B: () => "B" }));
  void (() => match(value, { A: () => "A", B: () => "B", _: "Fallback" }));
  void (() => match(value, { A: undefined, B: ({ value }) => value }));
  void (() => match(value, { B: ({ value }) => value, _: "Fallback" }));
  void (() => match(value, { A: true, B: false, _: undefined }));
}
```

```ts
import { match_ } from "unenum";

{
  const value = {} as Enum<{ A: true; B: { value: string } }, "custom">;

  void (() => match_(value, "custom", { _: "Fallback" }));
  void (() => match_(value, "custom", { A: "A", B: "B" }));
  void (() => match_(value, "custom", { A: "A", _: "Fallback" }));
  // ...
}
```

### Manipulating an Enum
- These utilities as available as part of the `Enum` type import's namespace.
- All of these Enum type utilities support a custom discriminant as the last
  type parameter, e.g. `Enum.Root<Signal, "custom">`.

```ts
// example
type Signal = Enum<{ Red: true; Yellow: true; Green: true }>;
```

#### `Enum.Root`
- Infers a key/value mapping of an Enum's variants.

```ts
export type Root = Enum.Root<Signal>;

// { Red: true, Yellow: true; Green: true }
```

#### `Enum.Keys`
- Infers all keys of an Enum's variants.

```ts
export type Keys = Enum.Keys<Signal>;

// "Red" | "Yellow" | "Green"
```

#### `Enum.Pick`
- Pick subset of an Enum's variants by key.

```ts
export type PickRed = Enum.Pick<Signal, "Red">;

// *Red

export type PickRedYellow = Enum.Pick<Signal, "Red" | "Yellow">;

// *Red | *Yellow
```

#### `Enum.Omit`
- Omit subset of an Enum's variants by key.

```ts
export type OmitRed = Enum.Omit<Signal, "Red">;

// *Yellow | *Green

export type OmitRedYellow = Enum.Omit<Signal, "Red" | "Yellow">;

// *Green
```

#### `Enum.Extend`
- Add new variants and merge new properties for existing variants for an Enum.

```ts
export type Extend = Enum.Extend<Signal, { Flashing: true }>;

// *Red | *Yellow | *Green | *Flashing
```

#### `Enum.Merge`
- Merge all variants and properties of all given Enums.

```ts
export type Merge = Enum.Merge<Enum<{ Left: true }> | Enum<{ Right: true }>>;

// *Left | *Right
```

### Enums with custom discriminants
- Instead of using the default discriminant, all types and utilities can
  specify a custom discriminant as an optional argument.

#### Defining

```ts
export type File = Enum<
  {
    "text/plain": { data: string };
    "image/jpeg": { data: Buffer; compression?: number };
    "application/json": { data: unknown };
  },
  "mime" /* <-- */
>;
```

#### Instantiating

##### (a) builder function
- Use `builder_` which requires the discriminant to be passed as an argument.

```ts
import { builder_ } from "unenum";

export const File = builder_({} as File, "mime" /* <-- */);

{
  const file: File = File["text/plain"]({ data: "..." });
  void file;

  void (() => File["text/plain"]({ data: "..." }));
  void (() => File["image/jpeg"]({ data: Buffer.from("...") }));
  void (() => File["application/json"]({ data: JSON.parse("{}") }));
}
```

##### (b) object expression

```ts
{
  const file: File = { mime: "text/plain", data: "..." };
  void file;

  void ((): File => ({ mime: "text/plain", data: "..." }));
  void ((): File => ({ mime: "image/jpeg", data: Buffer.from("...") }));
  void ((): File => ({ mime: "application/json", data: JSON.parse("{}") }));
}
```

#### Using

#### (a.1) if statements, type-guard helper
- Use `is_` which requires the discriminant to be passed as an argument.

```ts
(function (file: File): string {
  if (is_(file, "mime" /* <-- */, "text/plain")) {
    return `Text`;
  }
  if (is_(file, "mime" /* <-- */, "image/jpeg")) {
    return "Image";
  }
  return "Unsupported";
});
```

#### (a.2) if statements, property access

```ts
(function (file: File): string {
  if (file.mime /* <-- */ === "text/plain") {
    return `Text`;
  }
  if (file.mime /* <-- */ === "image/jpeg") {
    return "Image";
  }
  return "Unsupported";
});
```

#### (b) match helper
- Use `match_` which requires the discriminant to be passed as an argument.

```ts
(function (file: File): string {
  return match_(file, "mime" /* <-- */, {
    "text/plain": () => "Text",
    "image/jpeg": () => "Image",
    _: () => "Unsupported",
  });
});
```

## `Result`
- Represents either a success "value" (`Result.Ok`) or a failure "error"
  (`Result.Error`).

### Result without a value or error.

```ts
(function (): Result {
  if (Math.random()) {
    return Result.Error();
  }
  return Result.Ok();
});
```

### Result with a "value" and/or "error"
- `never` may be used for either `Value` or `Error` parameters if only the base
variant is needed without any value.

```ts
(function (): Result<User, "NotFound"> {
  const user = {} as User | undefined;
  if (!user) {
    return Result.Error("NotFound");
  }
  return Result.Ok(user);
});
```

### Using a Result value

#### (a) narrowing

```ts
(async function (): Promise<User | undefined> {
  const $user = await (async () => ({}) as Promise<Result<User>>)();
  // handle error
  if (is($user, "Error")) {
    return undefined;
  }
  // continue with value
  const user = $user.value;
  return user;
});
```

#### (b) matching

```ts
(async function (): Promise<User | undefined> {
  const $user = await (async () => ({}) as Promise<Result<User>>)();
  return match($user, {
    Ok: ({ value: user }) => user,
    Error: undefined,
  });
});
```

#### (c) value or `undefined` by property access
- The `Result` type defines both `value` and `error` properties in both
  `Result.Ok` and `Result.Error` variants, however either variant sets the value
  of the other as an falsy optional `never` property.
- This allows some cases where if your value is always truthy, you can skip
  type narrowing by accepting `undefined` as the properties possible states.

```ts
(async function (): Promise<User | undefined> {
  const $user = await (async () => ({}) as Promise<Result<User>>)();

  const user = $user.value;
  // User | undefined

  return user;
});
```

### `Result.from`
- Instead of wrapping code that could `throw` in `try`/`catch` blocks,
  `Result.from` can execute a given callback and return a `Result` wrapped value
  without interrupting a function's control flow or scoping of variables.
- If the function throws then the `Error` Result variant is returned, otherwise
  the `Ok` Result variant is returned.
- The `error` property will always be typed as `unknown` because
  (unfortunately) in JavaScript, anything from anywhere can be thrown as an
  error.

```ts
const getValueOrThrow = (): string => {
  if (Math.random()) {
    throw new Error("Failure");
  }
  return "Success";
};

(function () {
  const result = Result.from(() => getValueOrThrow());
  // Result<string, unknown>

  if (is(result, "Error")) {
    // handle error
    console.error(result.error);
    return;
  }

  // (safely) continue with value
  console.info(result.value);
});
```

## `Async`
- Represents an asynchronous value that is either loading (`Pending`) or
resolved (`Ready`). If defined with an `Enum` type, `Async` will omit its
`Ready` variant in favour of the "non-pending" `Enum`'s variants.
- Useful for representing states e.g. `use*` hooks.

```ts
import { Async } from "unenum";
```

### Async without a value

```ts
(function (): Async {
  if (Math.random()) {
    return Async.Pending();
  }
  return Async.Ready();
});
```

### Async with a non-Enum value

```ts
const useDeferredName = (): string | undefined => undefined;

(function useName(): Async<string> {
  const name = useDeferredName();
  if (!name) {
    return Async.Pending();
  }
  return Async.Ready(name);
});
```

### Async with a Enum value
- Which extends the given Enum value type with Async's `Pending` variant.
- You can use both `Async` and `Result` helpers together.

```ts
const useResource = <T>() => [{} as T | undefined, { loading: false }] as const;

(function useUser(): Async<Result<User, "NotFound">> {
  const [user, { loading }] = useResource<User | null>();
  if (loading) {
    return Async.Pending();
  }
  if (!user) {
    return Result.Error("NotFound");
  }
  return Result.Ok(user);
});
```

### Using a Async value

#### (a) narrowing

```ts
(function Component(): string {
  const $user = (() => ({}) as Async<Result<User, "E">>)();
  if (is($user, "Pending")) {
    return `<Loading />`;
  }

  // handle error
  if (is($user, "Error")) {
    const { error } = $user;
    return `<Error error=${error} />`;
  }

  // continue with value
  const user = $user.value;
  return `<Profile user=${user} />`;
});
```

#### (b) matching

```ts
(function Component() {
  const $user = (() => ({}) as Async<Result<User, unknown>>)();
  return match($user, {
    Pending: () => `<Loading />`,
    Error: ({ error }) => `<Error error=${error} />`,
    Ok: ({ value: user }) => `<Profile user=${user} />`,
  });
});
```

#### (c) value or undefined property access

```ts
(function Component() {
  const $user = (() => ({}) as Async<Result<User, "E">>)();
  if (is($user, "Pending")) {
    return `<Loading />`;
  }

  const user = $user.value;
  // User | undefined

  return `<Profile user=${user} />`;
});
```
