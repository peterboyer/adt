import type { RequiredKeys } from "./required-keys.js";

import type { Equal, Expect } from "pb.expectequal";

type I = 1;
!0 as Expect<Equal<RequiredKeys<{ foo?: I; bar?: I }>, never>>;
!0 as Expect<Equal<RequiredKeys<{ foo: I; bar?: I }>, "foo">>;
!0 as Expect<Equal<RequiredKeys<{ foo: I; bar: I }>, "foo" | "bar">>;

type U = unknown;
!0 as Expect<Equal<RequiredKeys<{ foo?: U; bar?: U }>, never>>;
!0 as Expect<Equal<RequiredKeys<{ foo: U; bar?: U }>, "foo">>;
!0 as Expect<Equal<RequiredKeys<{ foo: U; bar: U }>, "foo" | "bar">>;
