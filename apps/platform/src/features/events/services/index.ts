import type {
	Event,
	Discipline,
	AthleteWithDisciplines,
} from "@fan-athletics/shared/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { EventBasicData } from "#/../../api/src/events/index";
import { showToast } from "#/lib/toast";
import { useLocalSearchParams } from "expo-router";

const fetchEvents = async (): Promise<Event[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events`,
		{
			method: "GET",
		},
	);
	return await response.json();
};

const postEvent = async (data: EventBasicData) => {
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

const fetchEventDisciplines = async (
	eventId: string,
): Promise<Discipline[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${eventId}/disciplines`,
	);
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

export const useEventDiscpilinesQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useLocalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () => fetchEventDisciplines(currentEventId),
		queryKey: ["events-disciplines::retrieve", currentEventId],
		enabled: !!currentEventId
	});
};

export const useEventAthletesQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useLocalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () => fetchEventAthletes(currentEventId),
		queryKey: ["events-athletes::retrieve", currentEventId],
		enabled: !!currentEventId
	});
};

export const useEventsQuery = () => {
	return useQuery({
		queryFn: fetchEvents,
		queryKey: ["events::retrieve"],
	});
};

export const useEventCreatedMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: EventBasicData) => postEvent(values),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"] });
			showToast({
				text1: "Event Created",
				text2: "Your data has been saved successfully",
			});
		},
	});
};

export const useEventDeletedMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteEvent(id),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"] });
			showToast({
				text1: "Event Deleted",
				text2: "Data has been deleted successfully",
			});
		},
	});
};
