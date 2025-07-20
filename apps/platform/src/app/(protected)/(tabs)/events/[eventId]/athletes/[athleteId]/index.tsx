import { CircleUser } from "lucide-react-native";
import { Image, ScrollView, View } from "react-native";
import { Tabs, Typography } from "#/components";
import { useAthleteQuery } from "#/features/events";

export default function EventSingleAthlete() {
	const { data: athlete } = useAthleteQuery();

	if (!athlete) return null;

	return (
		<ScrollView className="px-4 md:px-8 xl:px-24 py-8">
			<View className="gap-y-6">
				<View className="justify-center items-center bg-gray-100 rounded-full w-16 h-16">
					{athlete.imageUrl ? (
						<Image source={{ uri: athlete.imageUrl }} />
					) : (
						<CircleUser size={24} className="text-gray-500" />
					)}
				</View>
				<Typography size="large4.5">
					{athlete.firstName} {athlete.lastName}
				</Typography>
				<View className="flex-row gap-8">
					{(
						[
							{ key: "disciplines", name: "Stowarzyszenie" },
							{ key: "cost", name: "Koszt" },
						] as const
					).map(({ key, name }) => (
						<View key={key} className="gap-y-1">
							<Typography size="small" type="washed">
								{name}
							</Typography>
							<Typography>
								{athlete[key]
									? Array.isArray(athlete[key])
										? athlete[key].join(", ")
										: `${athlete[key]} XP`
									: "Brak informacji"}
							</Typography>
						</View>
					))}
				</View>
			</View>
			<View className="gap-y-4">
				<Tabs
					items={[
						{ name: "Na zywo", href: "" },
						{ name: "Osiągnięcia", href: "" },
						{ name: "Dyscypliny", href: "" },
					]}
					className="mt-10"
				/>
			</View>
		</ScrollView>
	);
}
