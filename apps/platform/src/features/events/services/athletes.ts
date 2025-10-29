import type { SeasonBest, AthleteWithDisciplines, PersonalRecord } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useGlobalSearchParams } from "expo-router";
import fetcher from "#/helpers/fetcher";

export const useAthletesQuery = (query?: Record<string, string>) => {
	const eventId = useGlobalSearchParams().eventId?.toString();
	const params = new URLSearchParams({ eventId, ...query }).toString();

	return useQuery({
		queryFn: () =>
			fetcher<AthleteWithDisciplines[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/athletes?${params}`,
			),
		queryKey: ["athletes::retrieve", params],
		enabled: !!eventId && !!query,
	});
};

export const useAthleteQuery = (athleteId?: string) => {
	const { athleteId: defaultAthleteId } = useGlobalSearchParams();
	const currentAthleteId = athleteId ?? defaultAthleteId?.toString();

	return useQuery({
		queryFn: () =>
			fetcher<AthleteWithDisciplines>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/athletes/${currentAthleteId}`,
			),
		queryKey: ["athlete::retrieve", currentAthleteId],
		enabled: !!currentAthleteId,
	});
};

export const useAthletePersonalRecordsQuery = (athleteId: string) => {
	return useQuery({
		queryFn: () =>
			fetcher<PersonalRecord[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/athletes/${athleteId}/personal-records`,
			),
		queryKey: ["athlete::personal-records", athleteId],
		enabled: !!athleteId,
	})
}

export const useAthleteSeasonBestsQuery = (athleteId: string) => {
	return useQuery({
		queryFn: () =>
			fetcher<SeasonBest[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/athletes/${athleteId}/season-bests`,
			),
		queryKey: ["athlete::season-bests", athleteId],
		enabled: !!athleteId,
	})
}
