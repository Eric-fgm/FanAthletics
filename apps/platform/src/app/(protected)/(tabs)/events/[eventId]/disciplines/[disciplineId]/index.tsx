import { ScrollView, View } from "react-native";
import { Tabs, Typography } from "#/components";
import {
	CompetitionList,
	getDisciplineIcon,
	useAthletesQuery,
	useCompetitionsQuery,
	useDisciplineQuery,
} from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventSingleDiscipline() {
	const { data: discipline } = useDisciplineQuery();
	const { data: athletes = [] } = useAthletesQuery(
		discipline ? { disciplineId: discipline.id } : undefined,
	);
	const { data: competitions = [] } = useCompetitionsQuery(
		discipline ? { disciplineId: discipline.id } : undefined,
	);

	if (!discipline) return null;

	const Icon = getDisciplineIcon(discipline.icon);

	return (
		<ScrollArea>
			<Header
				icon={Icon}
				title={discipline.name}
				info={[
					{ name: "Stowarzyszenie", value: discipline.organization },
					{ name: "Rekord", value: discipline.record },
				]}
			/>
			<View className="gap-y-4">
				<Tabs
					items={[
						{ name: "Na zywo", href: "" },
						{ name: "Zawodnicy", href: "" },
					]}
					className="mt-10"
				/>
				{/* <AthleteList athletes={athletes} /> */}
				<CompetitionList competitions={competitions} />
			</View>
		</ScrollArea>
	);
}
