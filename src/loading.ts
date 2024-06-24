import type { Enum } from "./enum.js";
import { _Loading } from "./loading.builder.js";

export type Loading = Enum<{ Loading: true }>;

export const Loading = _Loading;

export namespace Loading {
	export type Ready<TValue = undefined> = Enum<{
		Ready: [TValue] extends [undefined]
			? { value?: undefined }
			: { value: TValue };
	}>;
}
