import { CircleUser } from "lucide-react-native";
import { Image, View } from "react-native";
import { Tabs } from "#/components";
import { DisciplineList, useAthleteQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventSingleAthlete() {
	const { data: athlete } = useAthleteQuery();

	if (!athlete) return null;

	return (
		<ScrollArea>
			<Header
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
						name: "Dyscypliny",
						value: athlete.disciplines.map(({ name }) => name).join(", "),
					},
					{ name: "Koszt", value: `${athlete.cost} XP` },
				]}
			/>
			<View className="gap-y-4">
				<Tabs
					items={[
						{ name: "Na zywo", href: "" },
						{ name: "Osiągnięcia", href: "" },
						{ name: "Dyscypliny", href: "" },
					]}
					className="mt-10"
				/>
				<DisciplineList disciplines={athlete.disciplines} />
			</View>
		</ScrollArea>
	);
}
