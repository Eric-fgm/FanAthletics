import type { EventPayload } from "@fan-athletics/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetcher from "#/helpers/fetcher";
import { showToast } from "#/lib/toast";

export const useEventCreateMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: EventPayload) =>
			fetcher(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/events`, {
				method: "POST",
				body: data,
			}),
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
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (eventId: string) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/events/${eventId}/pull`,
				{
					method: "POST",
				},
			),
		async onSuccess(_, eventId) {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["events-disciplines::retrieve", eventId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["events-athletes::retrieve", eventId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["events-competitions::retrieve", eventId],
				}),
			]);
			showToast({
				text1: "Zaciągnięto Zmiany",
				text2: "Dane zostały pomyślnie pobrane",
			});
		},
	});
};

export const useEventUpdateMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: EventPayload & { id: string }) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/events/${data.id}`,
				{
					method: "PUT",
					body: data,
				},
			),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"] });
			showToast({
				text1: "Zaktualizowano Wydarzenie",
				text2: "Twoje dane zostały pomyślnie zapisane",
			});
		},
	});
};

export const useEventDeletedMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) =>
			fetcher(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/events/${id}`, {
				method: "DELETE",
			}),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["events::retrieve"] });
			showToast({
				text1: "Usunięto Wydarzenie",
				text2: "Dane zostały pomyślnie usunięte",
			});
		},
	});
};
