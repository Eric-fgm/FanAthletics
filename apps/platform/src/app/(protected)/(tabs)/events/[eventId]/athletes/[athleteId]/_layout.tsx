import { Slot } from "expo-router";
import { CircleUser } from "lucide-react-native";
import { Image, View } from "react-native";
import { Tabs } from "#/components";
import { useAthleteQuery } from "#/features/events";
import { Header, HeaderWithIcon, ScrollArea } from "#/features/layout";

export default function EventSingleAthleteLayout() {
	const { data: athlete } = useAthleteQuery();

	if (!athlete) return null;

	return (
		<ScrollArea>
			<View className="px-4 lg:px-12">
				<HeaderWithIcon
					icon={
						athlete.imageUrl ? (
							<Image source={{ uri: athlete.imageUrl }} />
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
							name: "Na żywo",
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
