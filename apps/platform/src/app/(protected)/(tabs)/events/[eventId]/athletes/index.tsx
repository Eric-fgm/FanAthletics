import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Select, Typography } from "#/components";
import EventHeader from "#/components/event-header";
import {
	AthleteList,
	useEventAthletesQuery,
	useEventQuery,
} from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventAthletes() {
	const { data: athletes = [], isLoading: areAthletesLoading } =
		useEventAthletesQuery();
	const { data: event, isLoading: isEventLoading } = useEventQuery();

	return (
		<ScrollArea>
			<EventHeader event={event} />
			<Header title="Zawodnicy" />
			<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
				<View className="flex-row items-center gap-2">
					<Typography size="large2">Trending</Typography>
					<Typography
						size="small"
						className="flex justify-center items-center bg-gray-100 rounded-full w-6 h-6"
					>
						{athletes.length}
					</Typography>
				</View>
				<Select />
			</View>
			<View className="px-4 lg:px-12">
				<AthleteList
					athletes={athletes}
					placeholder={areAthletesLoading && <AthleteList.Skeleton />}
				/>
			</View>
		</ScrollArea>
	);
}
