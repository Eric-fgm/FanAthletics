import type {
	AthleteWithDisciplines,
	CompetitionWithCompetitors,
	Discipline,
	Event,
} from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useGlobalSearchParams } from "expo-router";
import fetcher from "#/helpers/fetcher";

export const useEventsQuery = (query?: Record<string, string>) => {
	const params = new URLSearchParams(query).toString();

	return useQuery({
		queryFn: () =>
			fetcher<Event[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events?${params}`,
			),
		queryKey: ["events::retrieve", params],
	});
};

export const useEventQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useGlobalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	const { data: events = [], ...restQuery } = useEventsQuery();

	return {
		data: events.find((event) => event.id === currentEventId),
		...restQuery,
	};
};

export const useEventCompetitionsQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useGlobalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () =>
			fetcher<CompetitionWithCompetitors[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${currentEventId}/competitions`,
			),
		queryKey: ["events-competitions::retrieve", currentEventId],
		enabled: !!currentEventId,
	});
};

export const useEventAthletesQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useGlobalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () =>
			fetcher<AthleteWithDisciplines[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${currentEventId}/athletes`,
			),
		queryKey: ["events-athletes::retrieve", currentEventId],
		enabled: !!currentEventId,
	});
};

export const useEventDiscpilinesQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useGlobalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () =>
			fetcher<Discipline[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${currentEventId}/disciplines`,
			),
		queryKey: ["events-disciplines::retrieve", currentEventId],
		enabled: !!currentEventId,
	});
};
