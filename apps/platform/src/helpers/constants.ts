import { Platform } from "react-native";

export const CALLBACK_URL =
	Platform.OS === "web"
		? `${process.env.EXPO_PUBLIC_WEB_URL}/sign-in`
		: "/sign-in";
