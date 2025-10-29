import { Slot } from "expo-router";
import { CircleUser } from "lucide-react-native";
import { Image, View } from "react-native";
import { Tabs } from "#/components";
import EventHeader from "#/components/event-header";
import { useAthleteQuery, useEventQuery } from "#/features/events";
import { HeaderWithIcon, ScrollArea } from "#/features/layout";

export default function EventSingleAthleteLayout() {
	const { data: athlete } = useAthleteQuery();
	const { data: event, isLoading: isEventLoading } = useEventQuery();

	if (!athlete) return null;

	return (
		<ScrollArea>
			<EventHeader event={event} />
			<View className="px-4 lg:px-12">
				<HeaderWithIcon
					icon={
						athlete.imageUrl ? (
							<Image
								source={{ uri: athlete.imageUrl }}
								style={{ width: "100%", height: "100%" }}
								className="rounded-full"
							/>
						) : (
							CircleUser
						)
					}
					title={`${athlete.firstName} ${athlete.lastName}`}
					info={[
						{ name: "Klub", value: athlete.coach },
						{
							name: "Konkurencje",
							value: athlete.disciplines.map(({ name }) => name).join(", "),
						},
						{ name: "Koszt", value: `${athlete.cost} XP` },
					]}
				/>
			</View>
			<View className="gap-y-8">
				<Tabs
					items={[
						{
							name: "Wyniki",
							href: `/events/${athlete.eventId}/athletes/${athlete.id}`,
						},
						{
							name: "Osiągnięcia",
							href: `/events/${athlete.eventId}/athletes/${athlete.id}/achievements`,
						},
						{
							name: "Dyscypliny",
							href: `/events/${athlete.eventId}/athletes/${athlete.id}/disciplines`,
						},
						// {
						// 	name: "Wyniki",
						// 	href: `/events/${athlete.eventId}/athletes/${athlete.id}/results`,
						// },
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
