import { Redirect, Slot } from "expo-router";
import { ScrollView } from "react-native";
import { useSessionSuspeneQuery } from "#/features/auth/services";
import { Header } from "#/features/navigation";
import { shouldBeOnboarded } from "#/helpers/user";

const TabsLayout = () => {
	const { data: session } = useSessionSuspeneQuery();

	if (!session) {
		return <Redirect href="/sign-in" />;
	}

	if (shouldBeOnboarded(session.user)) {
		return <Redirect href="/onboarding" />;
	}

	return (
		<>
			<Header />
			<ScrollView className="px-4 md:px-8 xl:px-24">
				<Slot />
			</ScrollView>
		</>
	);
};

export default TabsLayout;
