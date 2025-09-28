import {
	CompetitionList,
	useCompetitionsQuery,
	useDisciplineQuery,
} from "#/features/events";

export default function EventSingleDiscipline() {
	const { data: discipline } = useDisciplineQuery();
	const { data: competitions = [] } = useCompetitionsQuery(
		discipline ? { disciplineId: discipline.id } : undefined,
	);

	if (!discipline) return null;

	return <CompetitionList competitions={competitions} />;
}
