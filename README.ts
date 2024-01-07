/*!
<div align="center">

# unenum

**Universal ADT utilities for TypeScript.**

[Installation](#installation) • [`Enum`](#enum) • [`Enum.is`](#enumis) •
[`Enum.match`](#enummatch) • [`Result`](#result) • [`Result.try`](#resulttry)
• [`Async`](#async)
</div>

- produces simple and portable discriminated union types.
- all types can be compiled away, with zero-cost to bundle size.
- includes `Result` to improve error-handling ergonomics.
- includes `Enum` helpers to inspect/pick/omit/merge/extend variants.
- includes optional runtime helpers like `Enum.match` and `Result.try`.

Read more:
- [Tagged union](https://wikipedia.org/wiki/Tagged_union)
- [Algebraic data type](https://wikipedia.org/wiki/Algebraic_data_type)
- [Comparison of programming languages (algebraic data type)](https://wikipedia.org/wiki/Comparison_of_programming_languages_(algebraic_data_type))

## Installation

[![Version](https://img.shields.io/npm/v/unenum?label=npm)](https://www.npmjs.com/package/unenum/)
[![License](https://img.shields.io/npm/l/unenum)](./LICENSE)

```
yarn add unenum
```

```
npm install unenum
```

## Playground
- This README.ts is a valid TypeScript file!

1. Clone this repo: `git clone git@github.com:peterboyer/unenum.git`.
2. Install development dependencies: `npm install` or `yarn install`.
3. Jump in!

!*/

/*!
## `Enum`
!*/

//>
import { Enum } from "unenum";
//<

/*!
### Defining an Enum `type`
!*/

//>
export type User = Enum<{
	Anonymous: true;
	Authenticated: { userId: string };
}>;

// | { _type: "Anonymous" }
// | { _type: "Authenticated", userId: string }
//<

/*!
### Instantiating an Enum `value`
!*/

/*!
#### (a) object expression
- If you definitely want don't want to create runtime helpers.
!*/

//>
{
	const user: User = { _type: "Anonymous" };
	void user;

	void ((): User => ({ _type: "Anonymous" }));
	void ((): User => ({ _type: "Authenticated", userId: "..." }));
}
//<

/*!
#### (b) helper function
- Acts as both an `type` and an `value` constructor.
!*/

//>
export const User = Enum({} as User);

{
	const user: User = User.Anonymous();
	void user;

	void (() => User.Anonymous());
	void (() => User.Authenticated({ userId: "..." }));
}
//<

/*!
### Using an Enum `value`
!*/

/*!
#### (a.1) if statements, property access
!*/

//>
(function (user: User): string {
	if (user._type === "Authenticated") {
		return `Logged in as ${user.userId}.`;
	}
	return "Not logged in.";
});
//<

/*!
#### (a.2) if statements, type-guard helper
!*/

//>
(function (user: User): string {
	if (Enum.is(user, "Authenticated")) {
		return `Logged in as ${user.userId}.`;
	}
	return "Not logged in.";
});
//<

/*!
#### (b.1) match expression, handling all cases
!*/

//>
(function (user: User): string {
	return Enum.match(user, {
		Authenticated: ({ userId }) => `Logged in as ${userId}.`,
		Anonymous: () => "Not logged in.",
	});
});
//<

/*!
#### (b.2) match expression, with catch-all
!*/

//>
(function (user: User): string {
	return Enum.match(user, {
		Authenticated: ({ userId }) => `Logged in as ${userId}.`,
		_: () => "Not logged in.",
	});
});
//<

/*!
### `Enum.is`
- Returns `true` and narrows the given Enum `value`'s possible variants if the
  `value` matches any of the specified variants by key.
!*/

//>
{
	const value = {} as Enum<{ A: true; B: { value: string } }>;

	void (() => Enum.is(value, "A"));
	void (() => Enum.is(value, "B"));
	void (() => Enum.is(value, ["A"]));
	void (() => Enum.is(value, ["A", "B"]));
}

{
	const value = {} as Enum<{ A: true; B: { value: string } }, "custom">;

	void (() => Enum.is(value, "A", "custom"));
	void (() => Enum.is(value, "B", "custom"));
	void (() => Enum.is(value, ["A"], "custom"));
	void (() => Enum.is(value, ["A", "B"], "custom"));
}
//<

/*!
### `Enum.match`
- The `matcher` object is keyed with all possible variants of the Enum and an
  optional `_` fallback case.
- If the `_` fallback case is not given, _all_ variants must be specified.
- `matcher` cases can be a value or a callback.
- If a variant's case is a callback, that variants `value`'s properties are
  available for access.
!*/

//>
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

{
	const value = {} as Enum<{ A: true; B: { value: string } }, "custom">;

	void (() => Enum.match(value, { _: "Fallback" }, "custom"));
	void (() => Enum.match(value, { A: "A", B: "B" }, "custom"));
	void (() => Enum.match(value, { A: "A", _: "Fallback" }, "custom"));
	// ...
}
//<

/*!
### Manipulating Enum types
!*/

//>
type Signal = Enum<{ Red: true; Yellow: true; Green: true }>;
//<

/*!
#### `Enum.Root`
- Infers a key/value mapping of an Enum's variants.
!*/

//>
export type Root = Enum.Root<Signal>;

// { Red: true, Yellow: true; Green: true }
//<

/*!
#### `Enum.Keys`
- Infers all keys of an Enum's variants.
!*/

//>
export type Keys = Enum.Keys<Signal>;

// "Red" | "Yellow" | "Green"
//<

/*!
#### `Enum.Pick`
- Pick subset of an Enum's variants by key.
!*/

//>
export type PickRed = Enum.Pick<Signal, "Red">;

// *Red

export type PickRedYellow = Enum.Pick<Signal, "Red" | "Yellow">;

// *Red | *Yellow
//<

/*!
#### `Enum.Omit`
- Omit subset of an Enum's variants by key.
!*/

//>
export type OmitRed = Enum.Omit<Signal, "Red">;

// *Yellow | *Green

export type OmitRedYellow = Enum.Omit<Signal, "Red" | "Yellow">;

// *Green
//<

/*!
#### `Enum.Extend`
- Add new variants and merge new properties for existing variants for an Enum.
!*/

//>
export type Extend = Enum.Extend<Signal, { Flashing: true }>;

// *Red | *Yellow | *Green | *Flashing
//<

/*!
#### `Enum.Merge`
- Merge all variants and properties of all given Enums.
!*/

//>
export type Merge = Enum.Merge<Enum<{ Left: true }> | Enum<{ Right: true }>>;

// *Left | *Right
//<

/*!
### Define a custom constructor for an Enum variant's `value`
!*/

//>
type Colour = Enum<{
	Transparent: true;
	RGB: Record<"r" | "g" | "b", number>;
}>;

export const Colour = Enum({} as Colour, {
	RGB: (r: number, g: number, b: number) => ({ r, g, b }),
});

{
	const color: Colour = Colour.RGB(4, 2, 0);
	void color;

	void ((): Colour => Colour.RGB(0, 0, 0));
	void ((): Colour => Colour.Transparent());
}
//<

/*!
### Enums with arbitrary discriminants
- Instead of using the default discriminant, all types and utilities can
  specify a custom discriminant as an optional argument.
!*/

/*!
#### Defining
!*/

//>
export type File = Enum<
	{
		"text/plain": { data: string };
		"image/jpeg": { data: Buffer; compression?: number };
		"application/json": { data: unknown };
	},
	"mime" /* <-- */
>;
//<

/*!
#### Instantiating
!*/

/*!
##### (a) object expression
!*/

//>
{
	const file: File = { mime: "text/plain", data: "..." };
	void file;

	void ((): File => ({ mime: "text/plain", data: "..." }));
	void ((): File => ({ mime: "image/jpeg", data: Buffer.from("...") }));
	void ((): File => ({ mime: "application/json", data: JSON.parse("{}") }));
}
//<

/*!
##### (b) helper function
!*/

//>
export const File = Enum({} as File, "mime" /* <-- */);

{
	const file: File = File["text/plain"]({ data: "..." });
	void file;

	void (() => File["text/plain"]({ data: "..." }));
	void (() => File["image/jpeg"]({ data: Buffer.from("...") }));
	void (() => File["application/json"]({ data: JSON.parse("{}") }));
}
//<

/*!
#### Using
!*/

/*!
#### (a.1) if statements, property access
!*/

//>
(function (file: File): string {
	if (file.mime /* <-- */ === "text/plain") {
		return `Text`;
	}
	if (file.mime /* <-- */ === "image/jpeg") {
		return "Image";
	}
	return "Unsupported";
});
//<

/*!
#### (a.2) if statements, type-guard helper
!*/

//>
(function (file: File): string {
	if (Enum.is(file, "text/plain", "mime" /* <-- */)) {
		return `Text`;
	}
	if (Enum.is(file, "image/jpeg", "mime" /* <-- */)) {
		return "Image";
	}
	return "Unsupported";
});
//<

/*!
#### (b) match expression
!*/

//>
(function (file: File): string {
	return Enum.match(
		file,
		{
			"text/plain": () => "Text",
			"image/jpeg": () => "Image",
			_: () => "Unsupported",
		},
		"mime" /* <-- */,
	);
});
//<

/*!
## `Result`
- Represents either a success `value` (`Ok`) or a failure `error` (`Error`).
!*/

//>
import { Result } from "unenum";
//<

/*!
### Result without a `value` or `error`
!*/

//>
(function (): Result {
	if (Math.random()) {
		return Result.Error();
	}
	return Result.Ok();
});
//<

/*!
### Result with a `value` and/or `error`
- `never` is a valid type for `value` and `error`.
!*/

//>
(function (): Result<User, "NotFound"> {
	const user = {} as User | undefined;
	if (!user) {
		return Result.Error("NotFound");
	}
	return Result.Ok(user);
});
//<

/*!
### Using a Result `value`
!*/

/*!
#### (a) narrowing
!*/

//>
(async function (): Promise<User | undefined> {
	const $user = await (async () => ({}) as Promise<Result<User>>)();
	// handle error
	if (Enum.is($user, "Error")) {
		return undefined;
	}
	// continue with value
	const user = $user.value;
	return user;
});
//<

/*!
#### (b) matching
!*/

//>
(async function (): Promise<User | undefined> {
	const $user = await (async () => ({}) as Promise<Result<User>>)();
	return Enum.match($user, {
		Ok: ({ value: user }) => user,
		Error: () => undefined,
	});
});
//<

/*!
#### (c) value or undefined property access
!*/

//>
(async function (): Promise<User | undefined> {
	const $user = await (async () => ({}) as Promise<Result<User>>)();

	const user = $user.value;
	// User | undefined

	return user;
});
//<

/*!
## `Async`
- Represents an asynchronous `value` that is either loading (`Pending`) or
resolved (`Ready`). If defined with an `Enum` type, `Async` will omit its
`Ready` variant in favour of the "non-pending" `Enum`'s variants.
- Useful for representating states e.g. `use*` hooks.
!*/

//>
import { Async } from "unenum";
//<

/*!
### Async without a `value`
!*/

//>
(function (): Async {
	if (Math.random()) {
		return Async.Pending();
	}
	return Async.Ready();
});
//<

/*!
### Async with a non-Enum `value`
!*/

//>
const useDeferredName = (): string | undefined => undefined;

(function useName(): Async<string> {
	const name = useDeferredName();
	if (!name) {
		return Async.Pending();
	}
	return Async.Ready(name);
});
//<

/*!
### Async with a Enum `value`
- Which extends the given Enum `value` type with Async's `Pending` variant.
- You can use both `Async` and `Result` helpers together.
!*/

//>
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
//<

/*!
### Using a Async `value`
!*/

/*!
#### (a) narrowing
!*/

//>
(function Component(): string {
	const $user = (() => ({}) as Async<Result<User, "E">>)();
	if (Enum.is($user, "Pending")) {
		return `<Loading />`;
	}

	// handle error
	if (Enum.is($user, "Error")) {
		const { error } = $user;
		return `<Error error=${error} />`;
	}

	// continue with value
	const user = $user.value;
	return `<Profile user=${user} />`;
});
//<

/*!
#### (b) matching
!*/

//>
(function Component() {
	const $user = (() => ({}) as Async<Result<User, unknown>>)();
	return Enum.match($user, {
		Pending: () => `<Loading />`,
		Error: ({ error }) => `<Error error=${error} />`,
		Ok: ({ value: user }) => `<Profile user=${user} />`,
	});
});
//<

/*!
#### (c) value or undefined property access
!*/

//>
(function Component() {
	const $user = (() => ({}) as Async<Result<User, "E">>)();
	if (Enum.is($user, "Pending")) {
		return `<Loading />`;
	}

	const user = $user.value;
	// User | undefined

	return `<Profile user=${user} />`;
});
//<
