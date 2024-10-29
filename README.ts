/* eslint-disable no-inner-declarations */ //-

//+ # Install

/*!
```shell
npm install unenum
```

## Requirements

- `typescript@>=5.0.0`
- `tsconfig.json > "compilerOptions" > { "strict": true }`
!*/

//+ # Quickstart

/*!
`Enum` can create discriminated union types.
!*/

//>
import { Enum } from "unenum";

type Post_ = Enum<{
	Ping: true;
	Text: { title?: string; body: string };
	Photo: { url: string };
}>;
void {} as unknown as Post_; //-
//<

/*!
... which is identical to if you declared it manually.
!*/

//>
type Post__ =
	| { _type: "Ping" }
	| { _type: "Text"; title?: string; body: string }
	| { _type: "Photo"; url: string };
void {} as unknown as Post__; //-
//<

/*!
`Enum.define` can create discriminated union types and ease-of-use constructors.
!*/

//>
const Post = Enum.define(
	{} as {
		Ping: true;
		Text: { title?: string; body: string };
		Photo: { url: string };
	},
);

type Post = Enum.define<typeof Post>;
//<

/*!
Constructors can create Enum variant values:
- All constructed Enum variant values are plain objects.
- They match their variant types exactly.
- They do not have any methods or hidden properties.
!*/

//>
const posts: Post[] = [
	Post.Ping(),
	Post.Text({ body: "Hello, World!" }),
	Post.Photo({ url: "https://example.com/image.jpg" }),
];
void posts; //-
//<

/*!
The `Enum` provides ease-of-use utilities like `.switch` and `.match` for
working with discriminated unions.
!*/

//>
(function (post: Post): string {
	if (Enum.match(post, "Ping")) {
		return "Ping!";
	}

	return Enum.switch(post, {
		Text: ({ title }) => `Text("${title ?? "Untitled"}")`,
		_: () => `Unhandled`,
	});
});
//<

/*!
Enum variant values are simple objects, you can narrow and access properties as
you would any other object.
!*/

//>
function getTitleFromPost(post: Post): string | undefined {
	return post._type === "Text" ? post.title : undefined;
}
void getTitleFromPost; //-
//<

//+ <details><summary><code>Enum</code> supports creating discriminated unions with custom discriminants. <small>(Click for details…)</small></summary>
//+ <br />

//>
type File_ = Enum<
	{
		"text/plain": { data: string };
		"image/jpeg": { data: Buffer };
		"application/json": { data: unknown };
	},
	"mime"
>;
void {} as unknown as File_; //-
//<

/*!
This creates a discriminated union identical to if you did so manually.
!*/

//>
type File__ =
	| { mime: "text/plain"; data: string }
	| { mime: "image/jpeg"; data: Buffer }
	| { mime: "application/json"; data: unknown };
void {} as unknown as File__; //-
//<

/*!
`Enum.*` methods for custom discriminants can be accessed via the `.on()` method.
!*/

//>
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
void files; //-

(function (file: File): string {
	if (Enum.on("mime").match(file, "text/plain")) {
		return "Text!";
	}

	return Enum.on("mime").switch(file, {
		"image/jpeg": ({ data }) => `Image(${data.length})`,
		_: () => `Unhandled`,
	});
});
//<

//+ </details>

//hr

/*!
`Result` creates a discriminated union with an `Ok` and `Error` variant.
!*/

//>
import { Result } from "unenum";

export async function getUserCountFromDatabase(): Promise<
	Result<number, "DatabaseError">
> {
	const queriedCount = await Promise.resolve(1);
	return Result.Ok(queriedCount);
}
//<

/*!
... which is identical to if you declared it manually.
!*/

//>
export async function getUserCountFromDatabase_(): Promise<
	{ _type: "Ok"; value: number } | { _type: "Error"; error: "DatabaseError" }
> {
	const queriedCount = await Promise.resolve(1);
	return { _type: "Ok", value: queriedCount };
}
//<

/*!
`Result.from` calls a given callback that could `throw` and returns a `Result`
variant value:
- `Result.Ok` with the callback's return value,
- `Result.Error` with the callback's thrown error as a value.
!*/

//>
const queryDatabaseUserCount = async (): Promise<number> => 1; //-
export async function getUserCountFromDatabase__(): Promise<
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
//<

//+ <details><summary>Real-world example. <small>(Click for details…)</small></summary>
//+ <br />

//>
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
//<

//+ </details>

//hr

/*!
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
- [`Result`](#result)
	- [`Result.Ok`](#resultok)
	- [`Result.Error`](#resulterror)
- [`Pending`](#pending)
!*/

/*!
## `Enum`

```
(type) Enum<TVariants, TDiscriminant?>
```

- Creates a discriminated union `type` from a key-value map of variants.
- Use `true` for unit variants that don't have any data properties ([not
`{}`](https://www.totaltypescript.com/the-empty-object-type-in-typescript)).
!*/

//>>> Using the default discriminant.
//>
type Foo_ = Enum<{
	Unit: true;
	Data: { value: string };
}>;
void {} as unknown as Foo_; //-
//<
//<<<

//>>> Using a custom discriminant.
//>
type Foo__ = Enum<
	{
		Unit: true;
		Data: { value: string };
	},
	"custom"
>;
void {} as unknown as Foo__; //-
//<
//<<<

//backtotop

/*!
## `Enum.define`

```
(func) Enum.define(variants, options?: { [variant]: callback }) => builder
```
!*/

//>
const Foo = Enum.define(
	{} as {
		Unit: true;
		Data: { value: string };
	},
);

type Foo = Enum.define<typeof Foo>;
//<

//backtotop

/*!
## `Enum.match`

```
(func) Enum.match(value, variant | variants[]) => boolean
```
!*/

//>>> Match with one variant.
//>
const foo = Foo.Unit() as Foo;
const value = Enum.match(foo, "Unit");
void value; //-
//<
//<<<

//>>> Match with many variants.
//>
function getFileFormat(file: File): boolean {
	const isText = Enum.on("mime").match(file, [
		"text/plain",
		"application/json",
	]);
	return isText;
}
void getFileFormat; //-
//<
//<<<

//backtotop

/*!
## `Enum.switch`

```
(func) Enum.switch(
	value,
	matcher = { [variant]: value | callback; _?: value | callback }
) => inferred
```
!*/

//>>> Handle all cases.
//>
const foo_: Foo = Foo.Unit() as Foo;
const value_ = Enum.switch(foo_, {
	Unit: "Unit()",
	Data: ({ value }) => `Data(${value})`,
});
void value_; //-
//<
//<<<

//>>> Unhandled cases with fallback.
//>
const foo__: Foo = Foo.Unit() as Foo;
const value__ = Enum.switch(foo__, {
	Unit: "Unit()",
	_: "Unknown",
});
void value__; //-
//<
//<<<

//backtotop

/*!
## `Enum.value`

```
(func) Enum.value(variantName, variantProperties?) => inferred
```

- Useful if you add an additional Enum variant but don't have (or want to
define) a Enum builder for it.
!*/

//>>> Create an Enum value instance, (if possible) inferred from return type.
//>

function getOutput(): Enum<{
	None: true;
	Some: { value: unknown };
	All: true;
}> {
	if (Math.random()) return Enum.value("All");
	if (Math.random()) return Enum.value("Some", { value: "..." });
	return Enum.value("None");
}
void getOutput; //-
//<
//<<<

//backtotop

/*!
## `Enum.unwrap`

```
(func) Enum.unwrap(result, path) => inferred | undefined
```

- Extract a value's variant's property using a `"{VariantName}.{PropertyName}"`
path, otherwise returns `undefined`.
!*/

//>>> Safely wrap throwable function call, then unwrap the Ok variant's value or use a fallback.
//>
const result = Result.from(() => JSON.stringify("..."));
const valueOrFallback = Enum.unwrap(result, "Ok.value") ?? null;
void valueOrFallback; //-
//<
//<<<

//backtotop

/*!
## `Enum.on`

```
(func) Enum.on(discriminant) => { define, match, switch, value, unwrap }
```

- Redefines and returns all `Enum.*` runtime methods with a custom discriminant.
!*/

//>>> Define and use an Enum with a custom discriminant.
//>
const Foo___ = Enum.on("kind").define({} as { A: true; B: true });
type Foo___ = Enum.define<typeof Foo___>;

const value___ = Foo___.A() as Foo___;
Enum.on("kind").match(value___, "A");
Enum.on("kind").switch(value___, { A: "A Variant", _: "Other Variant" });
//<
//<<<

//backtotop

/*!
## `Enum.Root`

```
(type) Enum.Root<TEnum, TDiscriminant?>
```
!*/

//>>> Infer a key/value mapping of an Enum's variants.
//>
export type Root = Enum.Root<Enum<{ Unit: true; Data: { value: string } }>>;
// -> { Unit: true; Data: { value: string } }
//<
//<<<

//backtotop

/*!
## `Enum.Keys`

```
(type) Enum.Keys<TEnum, TDiscriminant?>
```
!*/
//>>> Infers all keys of an Enum's variants.
//>
export type Keys = Enum.Keys<Enum<{ Unit: true; Data: { value: string } }>>;
// -> "Unit" | "Data"
//<
//<<<

//backtotop

/*!
## `Enum.Pick`

```
(type) Enum.Pick<TEnum, TKeys, TDiscriminant?>
```
!*/
//>>> Pick subset of an Enum's variants by key.
//>
export type Pick = Enum.Pick<
	Enum<{ Unit: true; Data: { value: string } }>,
	"Unit"
>;
// -> { _type: "Unit" }
//<
//<<<

//backtotop

/*!
## `Enum.Omit`

```
(type) Enum.Omit<TEnum, TKeys, TDiscriminant?>
```
!*/
//>>> Omit subset of an Enum's variants by key.
//>
export type Omit = Enum.Omit<
	Enum<{ Unit: true; Data: { value: string } }>,
	"Unit"
>;
// -> *Data

// -> *Green
//<
//<<<

//backtotop

/*!
## `Enum.Extend`

```
(type) Enum.Extend<TEnum, TVariants, TDiscriminant?>
```
!*/

//>>> Add new variants and merge new properties for existing variants for an Enum.
//>
export type Extend = Enum.Extend<
	Enum<{ Unit: true; Data: { value: string } }>,
	{ Extra: true }
>;
// -> *Unit | *Data | *Extra
//<
//<<<

//backtotop

/*!
## `Enum.Merge`

```
(type) Enum.Merge<TEnums, TDiscriminant?>
```
!*/

//>>> Merge all variants and properties of all given Enums.
//>
export type Merge = Enum.Merge<Enum<{ Left: true }> | Enum<{ Right: true }>>;
// -> *Left | *Right
//<
//<<<

//backtotop

//hr

/*!
## `Result`

```
(type) Result<TOk?, TError?>
```

- A helper alias for `Result.Ok | Result.Error`.

> [!NOTE]
> This "Errors As Values" pattern allows known error cases to handled in a
type-safe way, as opposed to `throw`ing errors and relying on the caller to
remember to wrap it in `try`/`catch`.
!*/

//>>> Result without any values.
//>
export function getResult(): Result {
	const isValid = Math.random();

	if (!isValid) {
		return Result.Error();
	}

	return Result.Ok();
}
//<
//<<<

//>>> Result with Ok and Error values.
//>
const file = {} as File; //-
const getFile = (): File | undefined => undefined; //-
export function queryFile(): Result<File, "NotFound"> {
	const fileOrUndefined = getFile();

	if (fileOrUndefined) {
		return Result.Error("NotFound");
	}

	return Result.Ok(file);
}
//<
//<<<

/*!
## `Result.Ok`

```
(type) Enum.Ok<TOk?>
(func) Enum.Ok(inferred) => Enum.Ok<inferred>
```

- Represents a normal/success value, `{ _type: "Ok"; value: "..." }`.
!*/

//backtotop

/*!
## `Result.Error`

```
(type) Enum.Error<TError?>
(func) Enum.Error(inferred, cause?) => Enum.Error<inferred>
```

- Represents an error/failure value, `{ _type: "Error"; error: "..."; cause?: ... }`.
!*/

//backtotop

/*!
```
(func) Result.from(callback)
```

- Executes the callback within a `try`/`catch`:
	- returns a `Enum.Ok` with the callback's result,
	- otherwise a `Enum.Error` with the thrown error (if any).
!*/

//>>> Wrap a function that may throw.
//>
const fetchResult = await Result.from(() => fetch("/api/whoami"));

Enum.switch(fetchResult, {
	Ok: async ({ value: response }) => {
		const body = (await response.json()) as unknown;
		console.log(body);
	},
	Error: ({ error }) => {
		console.error(error);
	},
});
//<
//<<<

//backtotop

//hr

/*!
## `Pending`

```
(type) Pending
(func) Pending() => Pending
```

- Represents an pending state.
- Ideal for states' values or stateful functions (like React hooks).
!*/

//>>> React hook that returns a value, error, or pending state.
//>
import { Pending } from "unenum";

const useQuery = {} as any; //-
const gqlListItems = {} as any; //-
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
void useFetchedListItems; //-
//<
//<<<

//>>> React state that could be a loaded value, error, or loading state.
//>
type Element = any; //-
const useState = <T>(_t: T) => ({}) as [T, (t: T) => void]; //-
const useEffect = (_cb: () => void, _deps: never[]) => undefined; //-
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
	return Enum.switch(state, {
		Loading: () => `<Spinner />`,
		Ok: ({ value: { items } }) => `<ul>${items.map(() => `<li />`)}</ul>`,
		Error: ({ error }) => `<span>A ${error} error has occurred.</span>`,
	});
}
void Component; //-
//<
//<<<

//backtotop
