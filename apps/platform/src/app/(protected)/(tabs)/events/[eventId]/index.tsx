import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import EventHeader from "#/components/event-header";
import {
	CompetitionList,
	useEventCompetitionsQuery,
	useEventQuery,
} from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function SingleEvent() {
	const { data: competitions = [] } = useEventCompetitionsQuery();
	const { data: event, isLoading: isEventLoading } = useEventQuery();

	return (
		<ScrollArea>
			<EventHeader event={event} />
			<Header
				title="Aktualności"
				filters={[
					{
						key: "available",
						items: [
							{ name: "Wszystkie", value: "" },
							{ name: "Dostępne", value: "date" },
						],
						type: "switch",
					},
					{ key: "team", text: "Drużyna", type: "selectList" },
					{ key: "order", text: "Najnowsze", type: "selectList" },
				]}
			/>
			<CompetitionList
				competitions={competitions}
				className="px-4 lg:px-12 py-8"
			/>
		</ScrollArea>
	);
}
