import { Platform } from "react-native";
import authClient from "#/lib/auth-client";

const fetcher = async <T = unknown>(
	input: RequestInfo,
	init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> => {
	const cookie = Platform.OS !== "web" && { cookie: authClient.getCookie() };

	const response = await fetch(input, {
		credentials: "include",
		...init,
		body:
			typeof init?.body === "object" ? JSON.stringify(init?.body) : undefined,
		headers: {
			"Content-Type": "application/json",
			...cookie,
			...init?.headers,
		},
	});

	if (!response.ok) {
		throw new Error("Error while fetching");
	}

	return (await response.json()) as T;
};

export default fetcher;
