import { From } from "./from.js";

import type { Expect, Equal } from "../shared/testing.js";
import type { Result } from "../result.js";

it("should handle value", () => {
	const $value = From((): string => "foo");
	({}) as [Expect<Equal<typeof $value, Result<string, unknown>>>];
	expect($value).toMatchObject({ _type: "Ok", value: "foo" });
});

it("should handle union value", () => {
	const $value = From(() => "foo" as string | undefined);
	({}) as [Expect<Equal<typeof $value, Result<string | undefined, unknown>>>];
	expect($value).toMatchObject({ _type: "Ok", value: "foo" });
});

it("should handle error", () => {
	const $value = From(() => {
		throw new TypeError("bar");
	});
	({}) as [Expect<Equal<typeof $value, Result>>];
	expect($value).toMatchObject({ _type: "Error", error: { message: "bar" } });
});

it("should handle promise value", async () => {
	const $value = await From(() => (async () => "foo")());
	({}) as [Expect<Equal<typeof $value, Result<string, unknown>>>];
	expect($value).toMatchObject({ _type: "Ok", value: "foo" });
});

it("should handle promise union value", async () => {
	const $value = await From(() => (async () => "foo" as string | undefined)());
	({}) as [Expect<Equal<typeof $value, Result<string | undefined, unknown>>>];
	expect($value).toMatchObject({ _type: "Ok", value: "foo" });
});

it("should handle promise error", async () => {
	const $value = await From(() =>
		(async () => {
			throw new TypeError("bar");
		})(),
	);
	({}) as [Expect<Equal<typeof $value, Result<never, unknown>>>];
	expect($value).toMatchObject({ _type: "Error", error: { message: "bar" } });
});

it("should handle any as unknown", () => {
	const $value = From(() => JSON.parse(""));
	({}) as [Expect<Equal<typeof $value, Result<unknown, unknown>>>];
});
