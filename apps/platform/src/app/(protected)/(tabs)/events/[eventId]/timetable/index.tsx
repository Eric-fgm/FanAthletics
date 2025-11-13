import { View } from "react-native";
import { Typography } from "#/components";
import EventHeader from "#/components/event-header";
import { useCompetitionsQuery, useEventQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";
import { Timetable } from "./timetable";

export default function EventTimetable() {
	const { data: event, isLoading: isEventLoading } = useEventQuery();
	const { data: competitions = [], isLoading: areCompetitionsLoading } =
		useCompetitionsQuery();

	if (!event) return null;

	if (!competitions || competitions === undefined)
		return (
			<View className="py-5 px-12 items-center justify-center">
				<Typography size="large5">
					Wystąpił błąd podczas pobierania danych o konkurencjach
				</Typography>
			</View>
		);

	return (
		<ScrollArea>
			<EventHeader event={event} />
			<Header title="Harmonogram" />
			<View className="py-3 px-5 w-full">
				{competitions.length > 0 ? (
					<Timetable competitions={competitions} />
				) : (
					<Typography>Competitions not loaded</Typography>
				)}
			</View>
		</ScrollArea>
	);
}
