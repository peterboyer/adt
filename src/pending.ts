import type { Enum } from "./enum.js";

const _Pending: Pending = { _type: "Pending" };
export const Pending = (): Pending => _Pending;
export type Pending = Enum<{ Pending: true }>;
