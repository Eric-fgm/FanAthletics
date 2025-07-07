import { EventHeader } from "#/features/navigation";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

const TabsLayout = () => {
	const isWeb = Platform.OS === 'web'

	return <Tabs screenOptions={{ header: () => <EventHeader />, headerShown: isWeb, tabBarStyle: { display: isWeb ? 'none' : 'flex' }, sceneStyle: { backgroundColor: '#ffffff' } }} >
		<Tabs.Screen name="events/[eventId]/index" options={{
			title: 'Aktualności'
		}} />
		<Tabs.Screen name="events/[eventId]/leaderboard" options={{
			title: 'Tabela wyników',
		}} />
		<Tabs.Screen name="events/[eventId]/disciplines" options={{
			title: 'Dyscypliny',
		}} />
		<Tabs.Screen name="events/[eventId]/athletes" options={{
			title: 'Zawodnicy'
		}} />
	</Tabs>
};

export default TabsLayout;
