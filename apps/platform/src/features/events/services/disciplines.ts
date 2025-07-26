import type { Discipline } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useGlobalSearchParams } from "expo-router";
import fetcher from "#/helpers/fetcher";

export const useDisciplinesQuery = (
	query: Record<string, string | undefined>,
) => {
	const eventId = useGlobalSearchParams().eventId?.toString();
	const params = new URLSearchParams({ eventId, ...query }).toString();

	return useQuery({
		queryFn: () =>
			fetcher<Discipline[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/disciplines?${params}`,
			),
		queryKey: ["disciplines::retrieve", params],
		enabled: !!eventId,
	});
};

export const useDisciplineQuery = (disciplineId?: string) => {
	const { disciplineId: defaultDisciplineId } = useGlobalSearchParams();
	const currentDisciplineId = disciplineId ?? defaultDisciplineId?.toString();

	return useQuery({
		queryFn: () =>
			fetcher<Discipline>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/disciplines/${currentDisciplineId}`,
			),
		queryKey: ["discipline::retrieve", currentDisciplineId],
		enabled: !!currentDisciplineId,
	});
};
