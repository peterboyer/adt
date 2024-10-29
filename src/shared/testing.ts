export type Expect<T extends true> = T;

// prettier-ignore
export type Equal<A, B> = (
	<T>() => T extends A ? 1 : 2) extends
		(<T>() => T extends B ? 1 : 2)
	? true
	: false;

export type NotEqual<A, B> = Equal<A, B> extends true ? false : true;

export function branch(): boolean {
	return Math.random() === 1;
}
