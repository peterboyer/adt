/* eslint-disable no-inner-declarations */ //-

//+ # Install

/*!
```shell
npm install pb.adt
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
import { Enum } from "pb.adt";

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
		"image/jpeg": { data: ImageBitmap };
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
	| { mime: "image/jpeg"; data: ImageBitmap }
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
		"image/jpeg": { data: ImageBitmap };
		"application/json": { data: unknown };
	},
);

type File = Enum.define<typeof File>;

const files = [
	File["text/plain"]({ data: "..." }),
	File["image/jpeg"]({ data: new ImageBitmap() }),
	File["application/json"]({ data: {} }),
];
void files; //-

(function (file: File): string {
	if (Enum.on("mime").match(file, "text/plain")) {
		return "Text!";
	}

	return Enum.on("mime").switch(file, {
		"image/jpeg": ({ data }) => `Image(${data})`,
		_: () => `Unhandled`,
	});
});
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
//
//>>> UI Framework (e.g. React) rendering all state cases.
//>
type Element = any; //-
const useState = <T>(_t: T) => ({}) as [T, (t: T) => void]; //-
const useEffect = (_cb: () => void, _deps: never[]) => undefined; //-
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
void Component; //-
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
const value____ = { _type: "A", foo: "..." } as Enum<{
	A: { foo: string };
	B: { bar: number };
}>;
const valueOrFallback = Enum.unwrap(value____, "A.foo") ?? null;
void valueOrFallback; //-
//<
//<<<

//backtotop

/*!
## `Enum.on`

```
(func) Enum.on(discriminant) => { define, match, value, unwrap }
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
