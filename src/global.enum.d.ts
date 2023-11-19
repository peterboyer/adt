import type { Enum as _Enum } from "./enum";

declare global {
	// @ts-expect-error Duplicates don't exist for consumer.
	export { _Enum as Enum };
}
