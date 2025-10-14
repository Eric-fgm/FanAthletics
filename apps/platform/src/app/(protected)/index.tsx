import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Select, Switch, Typography } from "#/components";
import { EventItem, useEventsQuery } from "#/features/events";
import { ScrollArea } from "#/features/layout";

export default function Events() {
	const { status = "" } = useLocalSearchParams();
	const { data: events = [] } = useEventsQuery({
		available: status.toString(),
	});

	return (
		<ScrollArea className="pt-12 lg:pt-16 pb-8">
			<View className="px-4 lg:px-12 pb-8 border-[#eeeff1] border-b">
				<Typography size="large6">Wydarzenia</Typography>
			</View>
			<View className="flex-row items-center gap-4 px-4 lg:px-12 py-6 border-[#eeeff1] border-b">
				<Switch
					items={[
						{ name: "Wszystkie", value: "" },
						{ name: "Dostępne", value: "available" },
						{ name: "Niedostępne", value: "unavailable" },
					]}
					value={status.toString()}
					onChange={(value) =>
						router.setParams({ status: value ? value : undefined })
					}
				/>
			</View>
			<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
				<View className="flex-row items-center gap-2">
					<Typography size="large2">Trending</Typography>
					<Typography
						size="small"
						className="flex justify-center items-center bg-gray-100 rounded-full w-6 h-6"
					>
						{events.length}
					</Typography>
				</View>
				<Select />
			</View>
			<View className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 px-4 lg:px-12 w-full">
				{events.map((event) => (
					<EventItem key={event.id} {...event} />
				))}
			</View>
		</ScrollArea>
	);
}
