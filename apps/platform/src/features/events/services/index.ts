import type { Event } from "@fan-athletics/shared/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { EventBasicData } from "#/../../api/src/events/index"

const fetchEvents = async (): Promise<Event[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events`, {
			method: "GET"
		}
	);
	return await response.json();
};

const postEvent = async (data: EventBasicData) => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(data)
		}
	);
	if (!response.ok) {
		throw new Error("Błąd podczas tworzenia wydarzenia");
	}
	const res = await response.json();
	console.log(res);
	return res;
}

const deleteEvent = async (id: string) => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events/${id}`, {
			method: "DELETE",
		}
	);
	if (!response.ok) {
		throw new Error("Błąd podczas usuwania wydarzenia");
	}
	const res = await response.json();
	console.log(res);
	return res;
}

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
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"]});
		},
	});
}

export const useEventDeletedMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteEvent(id),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"]});
		},
	});
}