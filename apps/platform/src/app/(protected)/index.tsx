import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { Switch, Typography } from "#/components";
import { EventItem, useEventsQuery } from "#/features/events";

export default function Events() {
	const { available = "" } = useLocalSearchParams();
	const { data: events } = useEventsQuery({ available: available.toString() });

	return (
		<ScrollView className="px-4 md:px-8 xl:px-24 pt-16 pb-8">
			<View className="items-center">
				<Typography size="large5">Wydarzenia</Typography>
				<Typography type="washed" className="mt-4 text-center">
					Bądź na bieżąco z najważniejszymi momentami.
				</Typography>
				<View className="flex-row items-center gap-4 mt-8">
					<Switch
						items={[
							{ name: "Wszystkie", value: "" },
							{ name: "Dostępne", value: "date" },
						]}
						value={available.toString()}
						onChange={(value) =>
							router.setParams({ available: value ? value : undefined })
						}
					/>
				</View>
			</View>
			<View className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-16 w-full">
				{events?.map((event) => (
					<EventItem key={event.id} {...event} />
				))}
			</View>
		</ScrollView>
	);
}
