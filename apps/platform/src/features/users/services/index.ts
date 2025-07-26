import type { User } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import fetcher from "#/helpers/fetcher";

export const useUserQuery = (id: string) => {
	return useQuery({
		queryFn: () =>
			fetcher<User>(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/users/${id}`),
		queryKey: [`users::${id}`],
	});
};
