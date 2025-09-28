import {
	CompetitionList,
	useAthleteQuery,
	useCompetitionsQuery,
} from "#/features/events";

export default function EventSingleAthlete() {
	const { data: athlete } = useAthleteQuery();
	const { data: competitions = [] } = useCompetitionsQuery(
		athlete ? { athleteId: athlete.id } : undefined,
	);

	if (!athlete) return null;

	return <CompetitionList competitions={competitions} />;
}
