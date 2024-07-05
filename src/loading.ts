import type { Enum } from "./enum.js";
import { _Loading } from "./loading.builder.js";

export type Loading = Enum<{ Loading: true }>;

export const Loading = _Loading;
