import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdminTools, DevTools } from "#/features/admin";
import { useSessionSuspeneQuery } from "#/features/auth/services";
import { GlobalHeader, useLayoutStore } from "#/features/layout";
import { isAdmin, shouldBeOnboarded } from "#/helpers/user";

const ProtectedLayout = () => {
	const insets = useSafeAreaInsets();
	const { insets: layoutInsets } = useLayoutStore();
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
			/>
			<View
				style={{ bottom: insets.bottom + layoutInsets.bottom }}
				className="right-4 md:right-8 absolute flex-row gap-4 mb-4 md:mb-8 transition-[bottom] delay-300"
			>
				{__DEV__ && <DevTools />}
				{isAdmin(session.user) && <AdminTools />}
			</View>
		</>
	);
};

export default ProtectedLayout;
