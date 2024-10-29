import type { Enum } from "./enum.js";

export const Pending = (): Pending => ({ _type: "Pending" });

export type Pending = Enum<{ Pending: true }>;
