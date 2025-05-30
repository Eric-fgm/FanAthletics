import { expoClient } from "@better-auth/expo/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export default createAuthClient({
	baseURL: "http://localhost:8000",
	basePath: "/api/v1/auth",
	plugins: [
		expoClient({
			scheme: "fan-athletics",
			storage: SecureStore,
		}),
		magicLinkClient(),
	],
});
