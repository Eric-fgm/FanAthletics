import { Redirect, Stack } from "expo-router";
import { useSessionSuspeneQuery } from "#/features/auth/services";
import { GlobalHeader } from "#/features/navigation";
import { shouldBeOnboarded } from "#/helpers/user";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProtectedLayout = () => {
	const { data: session } = useSessionSuspeneQuery();
	const insets = useSafeAreaInsets();

	if (!session) {
		return <Redirect href="/sign-in" />;
	}

	if (shouldBeOnboarded(session.user)) {
		return <Redirect href="/onboarding" />;
	}

	return (
		<View style={{ paddingTop: insets.top, flex: 1 }}>
			<Stack
				screenOptions={{
					header: () => <GlobalHeader />,
					contentStyle: {
						backgroundColor: "#ffffff",
					},
				}}
			>
				<Stack.Screen name="index" />
			</Stack>
		</View>
	);
};

export default ProtectedLayout;
