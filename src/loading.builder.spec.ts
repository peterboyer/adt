import { branch } from "./testing.js";
import { Loading } from "./loading.js";

describe("Async", () => {
	test("Loading", () => {
		expect(Loading()).toStrictEqual({
			_type: "Loading",
		});
	});

	test("Ready", () => {
		expect(Loading.Ready("...")).toStrictEqual({
			_type: "Ready",
			value: "...",
		});
	});

	void function getFoo(): Loading | Loading.Ready<string> {
		if (branch()) {
			// @ts-expect-error Expecting an arg.
			return Loading.Ready();
		}
		if (branch()) {
			return Loading();
		}
		return Loading.Ready("1");
	};

	void async function getFooAsync(): Promise<Loading | Loading.Ready<string>> {
		if (branch()) {
			// @ts-expect-error Expecting an arg.
			return Async.Ready();
		}
		if (branch()) {
			// @ts-expect-error 1 is not assignable to `string`.
			return Async.Ready(1);
		}
		if (branch()) {
			return Loading();
		}
		return Loading.Ready("1");
	};

	void function getResult(): Loading | Loading.Ready {
		if (branch()) {
			return Loading();
		}
		return Loading.Ready();
	};

	void function getAnything(): string {
		if (branch()) {
			// @ts-expect-error Not assignable to return type.
			return Loading();
		}
		if (branch()) {
			// @ts-expect-error Not assignable to return type.
			return Loading.Ready();
		}
		if (branch()) {
			// @ts-expect-error Not assignable to return type.
			return Loading.Ready("...");
		}
		return "...";
	};
});
