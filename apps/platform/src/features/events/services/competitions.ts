import type { CompetitionWithCompetitors } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useGlobalSearchParams } from "expo-router";
import fetcher from "#/helpers/fetcher";

export const useCompetitionsQuery = (
	query?: Record<string, string | undefined>,
) => {
	const eventId = useGlobalSearchParams().eventId?.toString();
	const params = new URLSearchParams({ eventId, ...query }).toString();

	return useQuery({
		queryFn: () =>
			fetcher<CompetitionWithCompetitors[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/competitions?${params}`,
			),
		queryKey: ["competitions::retrieve", params],
		enabled: !!eventId,
	});
};
