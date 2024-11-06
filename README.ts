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
`ADT` can create discriminated union types.
!*/

//>
import { ADT } from "pb.adt";

type Post_ = ADT<{
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
	| { $type: "Ping" }
	| { $type: "Text"; title?: string; body: string }
	| { $type: "Photo"; url: string };
void {} as unknown as Post__; //-
//<

/*!
`ADT.define` can create discriminated union types and ease-of-use constructors.
!*/

//>
const Post = ADT.define(
	{} as {
		Ping: true;
		Text: { title?: string; body: string };
		Photo: { url: string };
	},
);

type Post = ADT.define<typeof Post>;
//<

/*!
Constructors can create ADT variant values:
- All constructed ADT variant values are plain objects.
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
The `ADT` provides ease-of-use utilities like `.switch` and `.match` for
working with discriminated unions.
!*/

//>
(function (post: Post): string {
	if (ADT.match(post, "Ping")) {
		return "Ping!";
	}

	return ADT.switch(post, {
		Text: ({ title }) => `Text("${title ?? "Untitled"}")`,
		_: () => `Unhandled`,
	});
});
//<

/*!
`ADT` variant values are simple objects, you can narrow and access properties as
you would any other object.
!*/

//>
function getTitleFromPost(post: Post): string | undefined {
	return post.$type === "Text" ? post.title : undefined;
}
void getTitleFromPost; //-
//<

//+ <details><summary><code>ADT</code> supports creating discriminated unions with custom discriminants. <small>(Click for details…)</small></summary>
//+ <br />

//>
type File_ = ADT<
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
`ADT.*` methods for custom discriminants can be accessed via the `.on()` method.
!*/

//>
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
void files; //-

(function (file: File): string {
	if (ADT.on("mime").match(file, "text/plain")) {
		return "Text!";
	}

	return ADT.on("mime").switch(file, {
		"image/jpeg": ({ data }) => `Image(${data})`,
		_: () => `Unhandled`,
	});
});
//<

//+ </details>

//hr

/*!
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
!*/

/*!
## `ADT`

```
(type) ADT<TVariants, TDiscriminant?>
```

- Creates a discriminated union `type` from a key-value map of variants.
- Use `true` for unit variants that don't have any data properties ([not
`{}`](https://www.totaltypescript.com/the-empty-object-type-in-typescript)).
!*/

//>>> Using the default discriminant.
//>
type Foo_ = ADT<{
	Unit: true;
	Data: { value: string };
}>;
void {} as unknown as Foo_; //-
//<
//<<<

//>>> Using a custom discriminant.
//>
type Foo__ = ADT<
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
## `ADT.define`

```
(func) ADT.define(variants, options?: { [variant]: callback }) => builder
```
!*/

//>
const Foo = ADT.define(
	{} as {
		Unit: true;
		Data: { value: string };
	},
);

type Foo = ADT.define<typeof Foo>;
//<

//backtotop

/*!
## `ADT.match`

```
(func) ADT.match(value, variant | variants[]) => boolean
```
!*/

//>>> Match with one variant.
//>
const foo = Foo.Unit() as Foo;
const value = ADT.match(foo, "Unit");
void value; //-
//<
//<<<

//>>> Match with many variants.
//>
function getFileFormat(file: File): boolean {
	const isText = ADT.on("mime").match(file, ["text/plain", "application/json"]);
	return isText;
}
void getFileFormat; //-
//<
//<<<

//backtotop

/*!
## `ADT.switch`

```
(func) ADT.switch(
	value,
	matcher = { [variant]: value | callback; _?: value | callback }
) => inferred
```
!*/

//>>> Handle all cases.
//>
const foo_: Foo = Foo.Unit() as Foo;
const value_ = ADT.switch(foo_, {
	Unit: "Unit()",
	Data: ({ value }) => `Data(${value})`,
});
void value_; //-
//<
//<<<

//>>> Unhandled cases with fallback.
//>
const foo__: Foo = Foo.Unit() as Foo;
const value__ = ADT.switch(foo__, {
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
void Component; //-
//<
//<<<

//backtotop

/*!
## `ADT.value`

```
(func) ADT.value(variantName, variantProperties?) => inferred
```

- Useful if you add an additional ADT variant but don't have (or want to
define) a ADT builder for it.
!*/

//>>> Create an ADT value instance, (if possible) inferred from return type.
//>

function getOutput(): ADT<{
	None: true;
	Some: { value: unknown };
	All: true;
}> {
	if (Math.random()) return ADT.value("All");
	if (Math.random()) return ADT.value("Some", { value: "..." });
	return ADT.value("None");
}
void getOutput; //-
//<
//<<<

//backtotop

/*!
## `ADT.unwrap`

```
(func) ADT.unwrap(result, path) => inferred | undefined
```

- Extract a value's variant's property using a `"{VariantName}.{PropertyName}"`
path, otherwise returns `undefined`.
!*/

//>>> Safely wrap throwable function call, then unwrap the Ok variant's value or use a fallback.
//>
const value____ = { $type: "A", foo: "..." } as ADT<{
	A: { foo: string };
	B: { bar: number };
}>;
const valueOrFallback = ADT.unwrap(value____, "A.foo") ?? null;
void valueOrFallback; //-
//<
//<<<

//backtotop

/*!
## `ADT.on`

```
(func) ADT.on(discriminant) => { define, match, value, unwrap }
```

- Redefines and returns all `ADT.*` runtime methods with a custom discriminant.
!*/

//>>> Define and use an ADT with a custom discriminant.
//>
const Foo___ = ADT.on("kind").define({} as { A: true; B: true });
type Foo___ = ADT.define<typeof Foo___>;

const value___ = Foo___.A() as Foo___;
ADT.on("kind").match(value___, "A");
ADT.on("kind").switch(value___, { A: "A Variant", _: "Other Variant" });
//<
//<<<

//backtotop

/*!
## `ADT.Root`

```
(type) ADT.Root<Tadt, TDiscriminant?>
```
!*/

//>>> Infer a key/value mapping of an ADT's variants.
//>
export type Root = ADT.Root<ADT<{ Unit: true; Data: { value: string } }>>;
// -> { Unit: true; Data: { value: string } }
//<
//<<<

//backtotop

/*!
## `ADT.Keys`

```
(type) ADT.Keys<Tadt, TDiscriminant?>
```
!*/
//>>> Infers all keys of an ADT's variants.
//>
export type Keys = ADT.Keys<ADT<{ Unit: true; Data: { value: string } }>>;
// -> "Unit" | "Data"
//<
//<<<

//backtotop

/*!
## `ADT.Pick`

```
(type) ADT.Pick<Tadt, TKeys, TDiscriminant?>
```
!*/
//>>> Pick subset of an ADT's variants by key.
//>
export type Pick = ADT.Pick<
	ADT<{ Unit: true; Data: { value: string } }>,
	"Unit"
>;
// -> { $type: "Unit" }
//<
//<<<

//backtotop

/*!
## `ADT.Omit`

```
(type) ADT.Omit<Tadt, TKeys, TDiscriminant?>
```
!*/
//>>> Omit subset of an ADT's variants by key.
//>
export type Omit = ADT.Omit<
	ADT<{ Unit: true; Data: { value: string } }>,
	"Unit"
>;
// -> *Data

// -> *Green
//<
//<<<

//backtotop

/*!
## `ADT.Extend`

```
(type) ADT.Extend<Tadt, TVariants, TDiscriminant?>
```
!*/

//>>> Add new variants and merge new properties for existing variants for an ADT.
//>
export type Extend = ADT.Extend<
	ADT<{ Unit: true; Data: { value: string } }>,
	{ Extra: true }
>;
// -> *Unit | *Data | *Extra
//<
//<<<

//backtotop

/*!
## `ADT.Merge`

```
(type) ADT.Merge<Tadts, TDiscriminant?>
```
!*/

//>>> Merge all variants and properties of all given ADTs.
//>
export type Merge = ADT.Merge<ADT<{ Left: true }> | ADT<{ Right: true }>>;
// -> *Left | *Right
//<
//<<<

//backtotop
