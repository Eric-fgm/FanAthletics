import type {
	AthleteWithDisciplines,
	Discipline,
	Event,
	EventPayload,
} from "@fan-athletics/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { showToast } from "#/lib/toast";

const fetchEvents = async (): Promise<Event[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events`,
		{
			method: "GET",
		},
	);
	return await response.json();
};

const createEvent = async (data: EventPayload) => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		},
	);
	if (!response.ok) {
		throw new Error("Błąd podczas tworzenia wydarzenia");
	}
	return await response.json();
};

const deleteEvent = async (id: string) => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${id}`,
		{
			method: "DELETE",
		},
	);
	if (!response.ok) {
		throw new Error("Błąd podczas usuwania wydarzenia");
	}
	return await response.json();
};

const fetchEventAthletes = async (
	eventId: string,
): Promise<AthleteWithDisciplines[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${eventId}/athletes`,
	);
	return await response.json();
};

const fetchEventDisciplines = async (
	eventId: string,
): Promise<Discipline[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${eventId}/disciplines`,
	);
	return await response.json();
};

export const useEventsQuery = () => {
	return useQuery({
		queryFn: fetchEvents,
		queryKey: ["events::retrieve"],
	});
};

export const useEventCreateMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createEvent,
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"] });
			showToast({
				text1: "Stworzono Wydarzenie",
				text2: "Twoje dane zostały pomyślnie zapisane",
			});
		},
	});
};

export const useEventDeletedMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteEvent,
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"] });
			showToast({
				text1: "Usunięto Wydarzenie",
				text2: "Dane zostały pomyślnie usunięte",
			});
		},
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
