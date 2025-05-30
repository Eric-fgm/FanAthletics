import type { User } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";

const fetchUser = async (id: string): Promise<User> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/users/${id}`,
	);
	return await response.json();
};

export const useUserQuery = (id: string) => {
	return useQuery({ queryFn: () => fetchUser(id), queryKey: [`users::${id}`] });
};
