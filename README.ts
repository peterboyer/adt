/*
 *  _ _ ___ ___ ___ _ _ _____
 * | | |   | -_|   | | |     |
 * |___|_|_|___|_|_|___|_|_|_|
 *
 * Universal ADT utilities for TypeScript.
 *
 * - produces simple and portable discriminated union types.
 * - all types can be compiled away, with zero-cost to bundle size.
 * - includes primitives like `Result` to improve function error-handling.
 * - includes general helpers to pick/omit/merge/extend/infer variants.
 * - *includes optional runtime helpers like `match` and `ResultTry`.
 *
 * Read more:
 * - wikipedia.org/wiki/Tagged_union
 * - wikipedia.org/wiki/Algebraic_data_type
 * - wikipedia.org/wiki/Comparison_of_programming_languages_(algebraic_data_type)
 *
 */

/*
 *
 * Installation
 *
 * - yarn add unenum
 * - npm install unenum
 *
 */

/*
 *
 * Playground
 *
 * - This README is a valid TypeScript file!
 *
 * 1. Clone this repo: `git clone git@github.com:peterboyer/unenum.git`.
 * 2. Install dependencies: `npm install` or `yarn install`.
 * 3. Jump in!
 *
 */

/*
 *
 * ==========
 * == Enum ==
 * ==========
 *
 */

import { type Enum } from "unenum";

/*
 *
 * Creating an Enum type.
 *
 * - Each property is a variant.
 * - `true` indicates a "unit" variant which has no other data.
 * - `{ ... }` indicates a "data" variant which can have other properties.
 *
 */

type User = Enum<{
	Anonymous: true;
	Authenticated: { userId: string };
}>;
// ^
// | { _type: "Anonymous" }
// | { _type: "Authenticated", userId: string }

/*
 *
 * Creating an Enum value.
 *
 * - Enum values are simple objects.
 * - You may write them explicitly with `{ ... }` object notation.
 *
 */

{
	const userAnonymous: User = { _type: "Anonymous" };
	const userAuthenticated: User = { _type: "Authenticated", userId: "1" };
	void [userAnonymous, userAuthenticated];
}

/*
 *
 * Using `Value`.
 *
 * - Or you may prefer the `Value` Enum value builder.
 *
 */

import { Value } from "unenum";
{
	const userAnonymous: User = Value("Anonymous");
	const userAuthenticated: User = Value("Authenticated", { userId: "1" });
	void [userAnonymous, userAuthenticated];
}

/*
 *
 * Using an Enum value.
 *
 * - You may handle Enum variants using its discriminant property directly.
 * - typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
 *
 */

{
	const formatUserStatus = (user: User): string => {
		if (user._type === "Authenticated") {
			return `User is logged in as ${user.userId}.`;
		}
		return "User is not logged in.";
	};
	void [formatUserStatus];
}

/*
 *
 * Using an Enum value with `match`.
 *
 * - You may prefer the `match` Enum value helper in some cases.
 *
 */

import { match } from "unenum";
{
	const formatUserStatus = (user: User): string =>
		match(user)({
			// case
			Authenticated: ({ userId }) => `User is logged in as ${userId}.`,
			// fallback
			_: () => "User is not logged in.",
		});
	void [formatUserStatus];
}

/*
 *
 * Strict `match`.
 *
 * - You may annotate the fallback case with `undefined` to indicate that all
 *   current and future variants must be explicitly handled.
 *
 */

void ((user: User): string =>
	match(user)({
		Anonymous: () => "User is not logged in.",
		Authenticated: ({ userId }) => `User is logged in as ${userId}.`,
		_: undefined,
	}));

/*
 *
 * Custom discriminants.
 *
 * - You may want to create Enums with a more descriptive discriminant.
 *
 */

type File = Enum<
	{
		"text/plain": { data: string };
		"image/jpeg": { data: unknown; compression?: number };
		"application/json": { object: unknown };
	},
	"mime" // <-- custom discriminant
>;
// ^
// | { "mime": "text/plain", ... }
// | { "mime": "image/jpeg", ... }
// | { "mime": "application/json", ... }

{
	const fileTextPlain: File = { mime: "text/plain", data: "..." };
	const fileImageJpeg: File = { mime: "image/jpeg", data: Buffer.from("...") };
	const fileApplicationJson: File = { mime: "application/json", object: {} };
	void [fileTextPlain, fileImageJpeg, fileApplicationJson];

	const formatFileInformation = (file: File) =>
		match(
			file,
			"mime" // <-- custom discriminant
		)({
			"text/plain": () => "Text",
			"image/jpeg": () => "Image",
			_: () => "Unsupported",
		});
}

/*
 *
 * Creating `Enum` sub-types with Enum.Pick and Enum.Omit.
 *
 */

export type UserAuthed = Enum.Pick<User, "Authenticated">;
// { _type: "Authenticated", userId: string }

export type FileWithText = Enum.Pick<File, "text/plain", "mime">;
// { "mime": "text/plain", ... }

export type UserUnauthed = Enum.Omit<User, "Authenticated">;
// { _type: "Anonymous" }

export type FileWithoutText = Enum.Omit<File, "text/plain", "mime">;
// { "mime": "image/jpeg", ... } | { "mime": "application/json", ... }

/*
 *
 * Infer all possible variant keys.
 *
 */

export type UserType = Enum.Keys<User>;
// "Anonymous" | "Authenticated"

export type FileType = Enum.Keys<File, "mime">;
// "text/plain" | "image/jpeg" | "application/json"

/*
 *
 * Infer all possible variants as an object type.
 * - Which is directly compatible with `Enum<{ ... }>`.
 *
 */

export type UserInferred = Enum.Infer<User>;
// {
//   Anonymous: true;
//   Authenticated: { userId: string };
// }

export type FileInferred = Enum.Infer<File, "mime">;
// {
//   "text/plain": { data: string };
//   "image/jpeg": { data: unknown; compression?: number };
//   "application/json": { object: unknown };
// }

/*
 *
 * Extend existing `Enum` types with new variants with `Enum.Extend`.
 *
 */

export type UserWithBanned = Enum.Extend<User, { Banned: true }>;
// | { _type: "Anonymous" }
// | { _type: "Authenticated", userId: string }
// | { _type: "Banned" }

export type FileWithHTML = Enum.Extend<File, { "text/html": true }, "mime">;
// | { "mime": "text/plain", ... }
// | { "mime": "image/jpeg", ... }
// | { "mime": "application/json", ... }
// | { "mime": "text/html", ... }

/*
 *
 * Merge two or more existing `Enum` types with `Enum.Merge`.
 * - This also merges the properties of variants of the same key.
 *
 */

type SetA = Enum<{ Foo: { a: string } }>;
type SetB = Enum<{ Foo: { b: number }; Bar: true }>;

export type Merged = Enum.Merge<SetA | SetB>;
// | { _type: "Foo"; a: string; b: number }
// | { _type: "Bar" }

/*
 *
 * ============
 * == Result ==
 * ============
 *
 */

import { type Result } from "unenum";

// Result
// | { _type: "Ok", value?: never, error?: never }
// | { _type: "Error", value?: never, error?: never }

// Result<User, "NotFound">
// | { _type: "Ok", value: User, error?: never }
// | { _type: "Error", value?: never, error: "NotFound" }

/*
 *
 * Instantiating a `Result` value.
 *
 * - You can create a `Result` value directly as an object: `{ _type: ... }`.
 * - Or you may use the `ResultOk` and `ResultError` helpers.
 *
 */

import { ResultOk, ResultError } from "unenum";

// raw
void ((): Result => ({ _type: "Ok" }));
void ((): Result => ({ _type: "Error" }));
void ((): Result<User, "NotFound"> => ({ _type: "Ok", value: userAnonymous }));
void ((): Result<User, "NotFound"> => ({ _type: "Error", error: "NotFound" }));

// with helper
void ((): Result => ResultOk());
void ((): Result => ResultError());
void ((): Result<User, "NotFound"> => ResultOk(userAnonymous));
void ((): Result<User, "NotFound"> => ResultError("NotFound"));

void ((): Result => Value("Ok"));
void ((): Result => Value("Error"));
void ((): Result<User, "NotFound"> => Value("Ok", { value: userAnonymous }));
void ((): Result<User, "NotFound"> => Value("Error", { error: "NotFound" }));
/*
 *
 * Returning `Result` values instead of throwing.
 *
 * - Thrown errors are not type-safe, and aren't part of a function's signature.
 * - Returning an "Error" allows the function's caller to handle it safely.
 *
 */

async function getUser(userId: number): Promise<Result<User, "NotFound">> {
	const db = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

	const user = (await db.query("...", [userId])) as User | undefined;

	if (!user) {
		return ResultError("NotFound");
	}

	return ResultOk(user);
}

/*
 *
 * Unwrapping a `Result`.
 *
 * - I prefer to prefix `Result` values with $ to reserve their non-prefixed
 *   values' name, e.g. `$user` (the wrapper) and `user` (the unwrapped value).
 *
 */

void (async () => {
	const $user = await getUser(1);

	// deal with the error
	if ($user.error) {
		return;
	}

	// safely access the narrowed value
	const { value: user } = $user;
	void user;
});

/*
 *
 * Usage with `match`.
 *
 */

void (async () => {
	const $user = await getUser(1);

	void match($user)({
		Ok: ({ value: user }) => {
			const message = match(user)({
				Authenticated: ({ userId }) => `Hello, user ${userId}!`,
				_: () => "Hello, stranger!",
			});
			console.log(message);
		},
		Error: ({ error }) => console.error(error),
	});
});

/*
 *
 * ===========
 * == Async ==
 * ===========
 *
 */

import { type Async } from "unenum";

// Async<string>
// | { _type: "Pending" }
// | { _type: "Ready" }
//
// Async<string>
// | { _type: "Pending"; value?: never }
// | { _type: "Ready"; value: never }

// Async.Enum<Result>
// | { _type: "Pending" }
// | { _type: "Ok", value?: never, error?: never }
// | { _type: "Error", value?: never, error?: never }

/*
 *
 * Instantiating an `Async` value.
 *
 * - You can create an `Async` value directly as an object: `{ _type: ... }`.
 * - Or you may use the `AsyncPending` and `AsyncReady` helpers.
 *
 */

import { AsyncPending, AsyncReady } from "unenum";

// raw
void ((): Async => ({ _type: "Pending" }));
void ((): Async => ({ _type: "Ready" }));
void ((): Async<string> => ({ _type: "Pending" }));
void ((): Async<string> => ({ _type: "Ready", value: "..." }));
void ((): Async.Enum<Result<User>> => ({ _type: "Pending" }));
void ((): Async.Enum<Result<User>> => ({ _type: "Ok", value: userAnonymous }));
void ((): Async.Enum<Result<User>> => ({ _type: "Error" }));

// with helper
void ((): Async => AsyncPending());
void ((): Async => AsyncReady());
void ((): Async<string> => ({ _type: "Pending" }));
void ((): Async<string> => ({ _type: "Ready", value: "..." }));
void ((): Async.Enum<Result<User>> => ({ _type: "Pending" }));
void ((): Async.Enum<Result<User>> => ({ _type: "Ok", value: userAnonymous }));
void ((): Async.Enum<Result<User>> => ({ _type: "Error" }));
