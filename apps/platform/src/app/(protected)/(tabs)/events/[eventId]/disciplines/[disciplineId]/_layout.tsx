import { Slot } from "expo-router";
import { View } from "react-native";
import { Tabs } from "#/components";
import { getDisciplineIcon, useDisciplineQuery, useEventQuery } from "#/features/events";
import { HeaderWithIcon, ScrollArea } from "#/features/layout";
import EventHeader from "#/components/event-header";

export default function EventSingleDisciplineLayout() {
	const { data: discipline } = useDisciplineQuery();
	const { data: event, isLoading: isEventLoading } = useEventQuery();

	if (!discipline) return null;

	const Icon = getDisciplineIcon(discipline.icon);

	return (
		<ScrollArea>
			<EventHeader event={event} />
			<View className="px-4 lg:px-12">
				<HeaderWithIcon
					icon={Icon}
					title={discipline.name}
					info={[
						{ name: "Stowarzyszenie", value: discipline.organization },
						{ name: "Rekord", value: discipline.record },
					]}
				/>
			</View>
			<View className="gap-y-8">
				<Tabs
					items={[
						{
							name: "Na żywo",
							href: `/events/${discipline.eventId}/disciplines/${discipline.id}`,
						},
						{
							name: "Zawodnicy",
							href: `/events/${discipline.eventId}/disciplines/${discipline.id}/athletes`,
						},
					]}
					className="mt-8 px-4 lg:px-12 border-[#eeeff1] border-b"
				/>
				<View className="px-4 lg:px-12">
					<Slot />
				</View>
			</View>
		</ScrollArea>
	);
}
