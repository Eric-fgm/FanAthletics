import { Redirect, Stack } from "expo-router";
import { useSessionSuspeneQuery } from "#/features/auth/services";
import { GlobalHeader } from "#/features/navigation";
import { shouldBeOnboarded } from "#/helpers/user";

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
		</>
	);
};

export default ProtectedLayout;
