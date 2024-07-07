import type { Expect, Equal } from "./testing.js";
import { Enum } from "./enum.js";

describe("Enum.Result", () => {
	it("should handle value", () => {
		const $value = Enum.Result((): string => "foo");
		({}) as [Expect<Equal<typeof $value, Enum.Result<string, unknown>>>];
		expect($value).toMatchObject({ _type: "Ok", value: "foo" });
	});

	it("should handle union value", () => {
		const $value = Enum.Result(() => "foo" as string | undefined);
		({}) as [
			Expect<Equal<typeof $value, Enum.Result<string | undefined, unknown>>>,
		];
		expect($value).toMatchObject({ _type: "Ok", value: "foo" });
	});

	it("should handle error", () => {
		const $value = Enum.Result(() => {
			throw new TypeError("bar");
		});
		({}) as [Expect<Equal<typeof $value, Enum.Result>>];
		expect($value).toMatchObject({ _type: "Error", error: { message: "bar" } });
	});

	it("should handle promise value", async () => {
		const $value = await Enum.Result(() => (async () => "foo")());
		({}) as [Expect<Equal<typeof $value, Enum.Result<string, unknown>>>];
		expect($value).toMatchObject({ _type: "Ok", value: "foo" });
	});

	it("should handle promise union value", async () => {
		const $value = await Enum.Result(() =>
			(async () => "foo" as string | undefined)(),
		);
		({}) as [
			Expect<Equal<typeof $value, Enum.Result<string | undefined, unknown>>>,
		];
		expect($value).toMatchObject({ _type: "Ok", value: "foo" });
	});

	it("should handle promise error", async () => {
		const $value = await Enum.Result(() =>
			(async () => {
				throw new TypeError("bar");
			})(),
		);
		({}) as [Expect<Equal<typeof $value, Enum.Result<never, unknown>>>];
		expect($value).toMatchObject({ _type: "Error", error: { message: "bar" } });
	});

	it("should handle any as unknown", () => {
		const $value = Enum.Result(() => JSON.parse(""));
		({}) as [Expect<Equal<typeof $value, Enum.Result<unknown, unknown>>>];
	});
});
