import type { Athlete, Discipline } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";
import fetcher from "#/helpers/fetcher";

export const useSearchQuery = (value: string) => {
	return useQuery({
		queryKey: ["search::retrieve", value],
		queryFn: () =>
			fetcher<{ athletes: Athlete[]; disciplines: Discipline[] }>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/search?query=${value}`,
			),
		enabled: !!value,
	});
};
