import type { Discipline } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

const fetchDiscipline = async (disciplineId: string): Promise<Discipline> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/disciplines/${disciplineId}`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	return await response.json();
};

const fetchDisciplines = async (
	query: Record<string, string>,
): Promise<Discipline[]> => {
	const params = new URLSearchParams(query);

	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/disciplines?${params.toString()}`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	return await response.json();
};

export const useDisciplinesQuery = (
	query: Record<string, string | undefined>,
) => {
	const eventId = useLocalSearchParams().eventId?.toString();

	return useQuery({
		queryFn: () => fetchDisciplines({ eventId, ...query }),
		queryKey: ["disciplines::retrieve", { eventId, ...query }],
		enabled: !!eventId,
	});
};

export const useDisciplineQuery = (disciplineId?: string) => {
	const { disciplineId: defaultDisciplineId } = useLocalSearchParams();
	const currentDisciplineId = disciplineId ?? defaultDisciplineId?.toString();

	return useQuery({
		queryFn: () => fetchDiscipline(currentDisciplineId),
		queryKey: ["discipline::retrieve", currentDisciplineId],
		enabled: !!currentDisciplineId,
	});
};
