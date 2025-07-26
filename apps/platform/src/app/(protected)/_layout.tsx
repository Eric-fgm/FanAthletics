import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { AdminTools, DevTools } from "#/features/admin";
import { useSessionSuspeneQuery } from "#/features/auth/services";
import { GlobalHeader } from "#/features/layout";
import { isAdmin, shouldBeOnboarded } from "#/helpers/user";

const ProtectedLayout = () => {
	const { data: session } = useSessionSuspeneQuery();

	if (!session) {
		return <Redirect href="/sign-in" />;
	}

	if (shouldBeOnboarded(session.user)) {
		return <Redirect href="/onboarding" />;
	}

	return (
		<>
			<GlobalHeader />
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: {
						backgroundColor: "#ffffff",
					},
				}}
			>
				<Stack.Screen name="index" />
			</Stack>
			<View className="right-8 bottom-8 absolute flex-row gap-4">
				{__DEV__ && <DevTools />}
				{isAdmin(session.user) && <AdminTools />}
			</View>
		</>
	);
};

export default ProtectedLayout;
