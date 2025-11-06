import { Tabs, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";
import { EventNavigation, useLayoutStore } from "#/features/layout";

const isWeb = Platform.OS === "web";

const TabsLayout = () => {
	const { setInsets } = useLayoutStore();

	useFocusEffect(
		useCallback(() => {
			if (isWeb) return;

			setInsets({ bottom: 50 });

			return () => {
				setInsets({ bottom: 0 });
			};
		}, [setInsets]),
	);

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
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
				name="events/[eventId]/disciplines"
				options={{
					title: "Konkurencje",
				}}
			/>
			<Tabs.Screen
				name="events/[eventId]/athletes"
				options={{
					title: "Zawodnicy",
				}}
			/>
			<Tabs.Screen
				name="events/[eventId]/participation/index"
				options={{
					title: "Druzyna",
					// href: null,
				}}
			/>
			<Tabs.Screen
				name="events/[eventId]/timetable/index"
				options={{
					title: "Harmonogram",
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
