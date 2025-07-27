import { expoClient } from "@better-auth/expo/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export default createAuthClient({
	baseURL: process.env.EXPO_PUBLIC_API_URL,
	basePath: "/api/v1/auth",
	fetchOptions: {
		credentials: "include",
	},
	plugins: [
		expoClient({
			scheme: "fan-athletics",
			storage: SecureStore,
		}),
		magicLinkClient(),
	],
});
