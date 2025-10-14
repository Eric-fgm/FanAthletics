import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Select, Typography } from "#/components";
import EventHeader from "#/components/event-header";
import {
	AthleteList,
	useAthletesQuery,
	useEventQuery,
} from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventAthletes() {
	const { sortBy = "" } = useLocalSearchParams();

	const { data: athletes = [], isLoading: areAthletesLoading } =
		useAthletesQuery({
		sortBy: sortBy.toString(),
	});
	const { data: event, isLoading: isEventLoading } = useEventQuery();

	return (
		<ScrollArea>
			<EventHeader event={event} />
			<Header title="Zawodnicy" />
			<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
				<View className="flex-row items-center gap-2">
					<Typography size="large2">Lista</Typography>
					<View className="flex justify-center items-center bg-gray-100 px-1.5 rounded-full h-6">
						<Typography size="small" className="!text-[10px]">
							{athletes.length < 100 ? athletes.length : "99+"}
						</Typography>
					</View>
				</View>
				<Select
					items={[
						{ name: "Domyślnie", value: "" },
						{ name: "Koszt", value: "cost" },
					]}
					value={sortBy}
					onChange={(value) =>
						router.setParams({ sortBy: value ? value : undefined })
					}
				/>
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
