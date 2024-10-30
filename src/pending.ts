import type { Enum } from "./enum.js";

export type Pending = Enum<{ Pending: true }>;

export const Pending = (): Pending => ({ _type: "Pending" });
