import type { AthletePayload } from "@fan-athletics/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetcher from "#/helpers/fetcher";
import { showToast } from "#/lib/toast";

export const useAthleteUpdateMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<AthletePayload> & { id: string }) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/athletes/${data.id}`,
				{
					method: "PUT",
					body: data,
				},
			),
		async onSuccess(_, { id }) {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["athletes::retrieve"],
				}),
				queryClient.invalidateQueries({
					queryKey: ["athlete::retrieve", id],
				}),
			]);
			showToast({
				text1: "Zaktualizowano Zawodnika",
				text2: "Twoje dane zostały pomyślnie zapisane",
			});
		},
	});
};
