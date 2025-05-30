import type { Event } from "@fan-athletics/shared/types";
import { useQuery } from "@tanstack/react-query";

const fetchEvents = async (): Promise<Event[]> => {
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/api/v1/events`,
	);
	return await response.json();
};

export const useEventsQuery = () => {
	return useQuery({
		queryFn: fetchEvents,
		queryKey: ["events::retrieve"],
	});
};
