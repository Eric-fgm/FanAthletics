import type { DisciplinePayload } from "@fan-athletics/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetcher from "#/helpers/fetcher";
import { showToast } from "#/lib/toast";

export const useDisciplineUpdateMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<DisciplinePayload> & { id: string }) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/admin/disciplines/${data.id}`,
				{
					method: "PUT",
					body: data,
				},
			),
		async onSuccess(_, { id }) {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["disciplines::retrieve"],
				}),
				queryClient.invalidateQueries({
					queryKey: ["discipline::retrieve", id],
				}),
			]);
			showToast({
				text1: "Zaktualizowano Dyscypline",
				text2: "Twoje dane zostały pomyślnie zapisane",
			});
		},
	});
};
