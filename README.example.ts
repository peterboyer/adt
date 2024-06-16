import { Enum, Result } from "unenum";

// 1. define

export type AuthState = typeof _AuthState;
export const [AuthState, _AuthState] = Enum.define(
	{} as {
		Authenticated: { userId: string };
		Anonymous: true;
	},
	{
		Authenticated: (userId: string) => ({ userId }),
	},
);

// 2. return types and values

export async function queryAuthState(): Promise<
	Result<AuthState, "FetchError">
> {
	const $queryIdentityEndpoint = await Result.from(() => fetch("/whoami"));
	if (Enum.match($queryIdentityEndpoint, "Error")) {
		return Result.Error("FetchError", $queryIdentityEndpoint.error);
	}

	if ($queryIdentityEndpoint.value.status !== 200) {
		return Result.Ok(AuthState.Anonymous());
	}

	const payload = (await $queryIdentityEndpoint.value.json()) as unknown;
	const payload_unsafe = payload as { id: string };
	const userId = payload_unsafe.id;
	return Result.Ok(AuthState.Authenticated(userId));
}

// 3. using values

const $queryAuthState = await queryAuthState();
if (Enum.match($queryAuthState, "Error")) {
	console.error(
		"Failed to query auth state from network...",
		$queryAuthState.error,
	);
} else {
	const authState = $queryAuthState.value;
	console.info(
		"Querying auth state from network.",
		Enum.switch(authState, {
			Anonymous: () => "anonymous",
			Authenticated: ({ userId }) => `authenticated as user: ${userId}`,
		}),
	);
}
