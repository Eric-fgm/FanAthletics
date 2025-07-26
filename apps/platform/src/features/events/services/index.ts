import type { Athlete, Discipline, Event } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

const fetchEvents = async (
	query?: Record<string, string>,
): Promise<Event[]> => {
	const params = new URLSearchParams(query);

	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events?${params.toString()}`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	if (!response.ok) {
		throw new Error("Error while fetching events");
	}
	return await response.json();
};

const fetchEventAthletes = async (eventId: string): Promise<Athlete[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${eventId}/athletes`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	if (!response.ok) {
		throw new Error("Error while fetching event athletes");
	}
	return await response.json();
};

const fetchEventDisciplines = async (
	eventId: string,
): Promise<Discipline[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${eventId}/disciplines`,
		{
			method: "GET",
			credentials: "include",
		},
	);
	if (!response.ok) {
		throw new Error("Error while fetching event disciplines");
	}
	return await response.json();
};

export const useEventsQuery = (query?: Record<string, string>) => {
	return useQuery({
		queryFn: () => fetchEvents(query),
		queryKey: ["events::retrieve", query],
	});
};

export const useEventAthletesQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useLocalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () => fetchEventAthletes(currentEventId),
		queryKey: ["events-athletes::retrieve", currentEventId],
		enabled: !!currentEventId,
	});
};

export const useEventDiscpilinesQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useLocalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () => fetchEventDisciplines(currentEventId),
		queryKey: ["events-disciplines::retrieve", currentEventId],
		enabled: !!currentEventId,
	});
};
