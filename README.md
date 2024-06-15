<div align="center">

# unenum

**Universal ADT utilities for TypeScript.**
</div>

```ts
import { Enum, Result } from "unenum";

// 1. define

export type AuthState = typeof _AuthState;
export const [AuthState, _AuthState] = Enum.new<{
  Authenticated: { userId: string };
  Anonymous: true;
}>().alias({
  Authenticated: (userId: string) => ({ userId }),
});

// 2. return types and values

export async function queryAuthState(): Promise<
  Result<AuthState, "FetchError">
> {
  const $queryIdentityEndpoint = await Result.from(() => fetch("/whoami"));
  if (Enum.match($queryIdentityEndpoint, "Error")) {
    return Result.Error("FetchError", $queryIdentityEndpoint.error);
  }

  if ($queryIdentityEndpoint.value.status !== 200) {
    return Result.Ok(AuthState.Anonymous());
  }

  const payload = (await $queryIdentityEndpoint.value.json()) as unknown;
  const payload_unsafe = payload as { id: string };
  const userId = payload_unsafe.id;
  return Result.Ok(AuthState.Authenticated(userId));
}

// 3. using values

const $queryAuthState = await queryAuthState();
if (Enum.match($queryAuthState, "Error")) {
  console.error(
    "Failed to query auth state from network...",
    $queryAuthState.error,
  );
} else {
  console.info(
    "Querying auth state from network.",
    Enum.switch($queryAuthState.value, {
      Anonymous: () => "anonymous",
      Authenticated: ({ userId }) => `authenticated as user: ${userId}`,
    }),
  );
}
```

<div align="center">

[Installation](#installation) • [`Enum`](#enum) • [`Enum.match`](#match) • [`Result`](#result) •
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


```

### Instantiating an Enum

#### (a) builder function
- [`builder`](#builder) creates an Enum value "constructor" typed with a given
  Enum type.
- You may define and export the builder with the same name
as your Enum's type.

```ts
export const User = Enum<{
  Anonymous: true;
  Authenticated: { userId: string };
}>();

export type User = Enum.Infer<typeof User>;
// | { _type: "Anonymous" }
// | { _type: "Authenticated", userId: string }

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
  if (Enum.match(user, "Authenticated")) {
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
  return Enum.match(user, {
    Authenticated: ({ userId }) => `Logged in as ${userId}.`,
    Anonymous: "Not logged in.",
  });
});
```

#### (b.2) match helper, with catch-all

```ts
(function (user: User): string {
  return Enum.match(user, {
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

export type Color = typeof $Color;
export const [Color, $Color] = Enum<{
  Transparent: true;
  Named: { name: string };
  RGB: Record<"r" | "g" | "b", number>;
}>().map({
  RGB: (r: number, g: number, b: number) => ({ r, g, b }),
});

{
  const color: Color = Color.RGB(4, 2, 0);
  void color;

  // variant with no properties
  void ((): Color => Color.Transparent());
  // variant with properties
  void ((): Color => Color.Named({ name: "Red" }));
  // variant with mapper function
  void ((): Color => Color.RGB(0, 0, 0));
}
```

```ts
{
  type Value = Enum<{ A: true; B: { value: string } }>;
  const value = {} as Value;

  void (() => Enum.match(value, "A"));
  void (() => Enum.match(value, "B"));
  void (() => Enum.match(value, ["A"]));
  void (() => Enum.match(value, ["A", "B"]));
}
```

```ts
{
  type Value = Enum<{ A: true; B: { value: string } }, "custom">;
  const value = {} as Value;

  void (() => Enum.match(value, "A", "custom"));
  void (() => Enum.match(value, "B", "custom"));
  void (() => Enum.match(value, ["A"], "custom"));
  void (() => Enum.match(value, ["A", "B"], "custom"));
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

  void (() => Enum.match(value, { _: "Fallback" }));
  void (() => Enum.match(value, { _: () => "Fallback" }));
  void (() => Enum.match(value, { A: "A", _: "Fallback" }));
  void (() => Enum.match(value, { A: () => "A", _: "Fallback" }));
  void (() => Enum.match(value, { A: "A", B: "B" }));
  void (() => Enum.match(value, { A: "A", B: () => "B" }));
  void (() => Enum.match(value, { A: () => "A", B: () => "B" }));
  void (() => Enum.match(value, { A: () => "A", B: () => "B", _: "Fallback" }));
  void (() => Enum.match(value, { A: undefined, B: ({ value }) => value }));
  void (() => Enum.match(value, { B: ({ value }) => value, _: "Fallback" }));
  void (() => Enum.match(value, { A: true, B: false, _: undefined }));
}
```

```ts
{
  const value = {} as Enum<{ A: true; B: { value: string } }, "custom">;

  void (() => Enum.match(value, { _: "Fallback" }, "custom"));
  void (() => Enum.match(value, { A: "A", B: "B" }, "custom"));
  void (() => Enum.match(value, { A: "A", _: "Fallback" }, "custom"));
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

#### Instantiating

##### (a) builder function
- Use `builder_` which requires the discriminant to be passed as an argument.

```ts

{
  type File = typeof $File;
  const [File, $File] = Enum.on("mime")<{
    "text/plain": { data: string };
    "image/jpeg": { data: Buffer; compression?: number };
    "application/json": { data: unknown };
  }>();

  {
    const file: File = File["text/plain"]({ data: "..." });
    void file;

    void (() => File["text/plain"]({ data: "..." }));
    void (() => File["image/jpeg"]({ data: Buffer.from("...") }));
    void (() => File["application/json"]({ data: JSON.parse("{}") }));
  }

  {
    const file: File = { mime: "text/plain", data: "..." };
    void file;

    void ((): File => ({ mime: "text/plain", data: "..." }));
    void ((): File => ({ mime: "image/jpeg", data: Buffer.from("...") }));
    void ((): File => ({ mime: "application/json", data: JSON.parse("{}") }));
  }
}

```

##### (b) object expression

```ts
```

#### Using

#### (a.1) if statements, type-guard helper
- Use `is_` which requires the discriminant to be passed as an argument.

```ts
(function (file: File): string {
  if (Enum.match(file, "text/plain")) {
    return `Text`;
  }
  if (Enum.match(file, "image/jpeg")) {
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
  return Enum.match(file, {
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
  if (Enum.match($user, "Error")) {
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
  return Enum.match($user, {
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

  if (Enum.match(result, "Error")) {
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
  if (Enum.match($user, "Pending")) {
    return `<Loading />`;
  }

  // handle error
  if (Enum.match($user, "Error")) {
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
  return Enum.match($user, {
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
  if (Enum.match($user, "Pending")) {
    return `<Loading />`;
  }

  const user = $user.value;
  // User | undefined

  return `<Profile user=${user} />`;
});
```
