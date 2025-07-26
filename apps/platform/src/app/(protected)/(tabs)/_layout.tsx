import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { EventNavigation } from "#/features/layout";

const TabsLayout = () => {
	const isWeb = Platform.OS === "web";

	return (
		<Tabs
			screenOptions={{
				header: () => <EventNavigation />,
				headerShown: isWeb,
				tabBarStyle: { display: isWeb ? "none" : "flex" },
				sceneStyle: { backgroundColor: "#ffffff" },
			}}
		>
			<Tabs.Screen
				name="events/[eventId]/index"
				options={{
					title: "Aktualności",
				}}
			/>
			<Tabs.Screen
				name="events/[eventId]/leaderboard/index"
				options={{
					title: "Tabela wyników",
				}}
			/>
			<Tabs.Screen
				name="events/[eventId]/disciplines/index"
				options={{
					title: "Dyscypliny",
				}}
			/>
			<Tabs.Screen
				name="events/[eventId]/athletes/index"
				options={{
					title: "Zawodnicy",
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
