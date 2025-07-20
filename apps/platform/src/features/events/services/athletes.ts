import type {
	Athlete,
	AthleteWithDisciplines,
} from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

const fetchAthlete = async (
	athleteId: string,
): Promise<AthleteWithDisciplines> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/athletes/${athleteId}`,
	);
	return await response.json();
};

const fetchAthletes = async (
	query: Record<string, string>,
): Promise<Athlete[]> => {
	const params = new URLSearchParams(query);

	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/athletes?${params.toString()}`,
	);
	return await response.json();
};

export const useAthletesQuery = (query?: Record<string, string>) => {
	const eventId = useLocalSearchParams().eventId?.toString();

	return useQuery({
		queryFn: () => fetchAthletes({ eventId, ...query }),
		queryKey: ["athletes::retrieve", eventId],
		enabled: !!eventId && !!query,
	});
};

export const useAthleteQuery = (athleteId?: string) => {
	const { athleteId: defaultAthleteId } = useLocalSearchParams();
	const currentAthleteId = athleteId ?? defaultAthleteId?.toString();

	return useQuery({
		queryFn: () => fetchAthlete(currentAthleteId),
		queryKey: ["athlete::retrieve", currentAthleteId],
		enabled: !!currentAthleteId,
	});
};
