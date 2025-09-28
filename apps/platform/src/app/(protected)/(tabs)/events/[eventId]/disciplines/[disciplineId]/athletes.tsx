import {
	AthleteList,
	useAthletesQuery,
	useDisciplineQuery,
} from "#/features/events";

export default function EventSingleDisciplineWithAthletes() {
	const { data: discipline } = useDisciplineQuery();
	const { data: athletes = [], isLoading } = useAthletesQuery(
		discipline ? { disciplineId: discipline.id } : undefined,
	);

	if (!discipline) return null;

	return (
		<AthleteList
			athletes={athletes}
			placeholder={isLoading && <AthleteList.Skeleton />}
		/>
	);
}
