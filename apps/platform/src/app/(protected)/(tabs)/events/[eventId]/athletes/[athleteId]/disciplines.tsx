import { DisciplineList, useAthleteQuery } from "#/features/events";

export default function EventSingleAthleteWithDisciplines() {
	const { data: athlete } = useAthleteQuery();

	if (!athlete) return null;

	return <DisciplineList disciplines={athlete.disciplines} />;
}
