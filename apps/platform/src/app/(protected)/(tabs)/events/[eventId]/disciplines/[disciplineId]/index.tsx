import { ScrollView, View } from "react-native";
import { Tabs, Typography } from "#/components";
import {
	AthleteList,
	getDisciplineIcon,
	useAthletesQuery,
	useDisciplineQuery,
} from "#/features/events";

export default function EventSingleDiscipline() {
	const { data: discipline } = useDisciplineQuery();
	const { data: athletes = [] } = useAthletesQuery(
		discipline ? { disciplineId: discipline.id } : undefined,
	);

	if (!discipline) return null;

	const Icon = getDisciplineIcon(discipline.icon);

	return (
		<ScrollView className="px-4 md:px-8 xl:px-24 py-8">
			<View className="gap-y-6">
				<View className="justify-center items-center bg-gray-100 rounded-full w-16 h-16">
					<Icon size={24} className="text-gray-500" />
				</View>
				<Typography size="large4.5">{discipline.name}</Typography>
				<View className="flex-row gap-8">
					{(
						[
							{ key: "organization", name: "Stowarzyszenie" },
							{ key: "record", name: "Rekord" },
						] as const
					).map(({ key, name }) => (
						<View key={key} className="gap-y-1">
							<Typography size="small" type="washed">
								{name}
							</Typography>
							<Typography>{discipline[key] ?? "Brak informacji"}</Typography>
						</View>
					))}
				</View>
			</View>
			<View className="gap-y-4">
				<Tabs
					items={[
						{ name: "Na zywo", href: "" },
						{ name: "Zawodnicy", href: "" },
					]}
					className="mt-10"
				/>
				<AthleteList athletes={athletes} />
			</View>
		</ScrollView>
	);
}
