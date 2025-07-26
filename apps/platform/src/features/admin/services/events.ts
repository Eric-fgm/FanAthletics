import type { EventPayload } from "@fan-athletics/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "#/lib/toast";

const createEvent = async (data: EventPayload) => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/events`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
			credentials: "include",
		},
	);
	if (!response.ok) {
		throw new Error("Błąd podczas tworzenia wydarzenia");
	}
	return await response.json();
};

const pullEvent = async (eventId: string) => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/events/${eventId}/pull`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		},
	);
	if (!response.ok) {
		throw new Error("Błąd podczas zaciągania wydarzenia");
	}
	return await response.json();
};

const deleteEvent = async (id: string) => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/events/${id}`,
		{
			method: "DELETE",
			credentials: "include",
		},
	);
	if (!response.ok) {
		throw new Error("Błąd podczas usuwania wydarzenia");
	}
	return await response.json();
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

export const useEventPullMutation = () => {
	return useMutation({
		mutationFn: pullEvent,
		async onSuccess() {
			showToast({
				text1: "Zaciągnięto Zmiany",
				text2: "Dane zostały pomyślnie pobrane",
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
