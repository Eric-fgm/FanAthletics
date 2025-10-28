import type {
	Athlete,
	GameSpecification,
	Participant,
	UserWithParticipation,
} from "@fan-athletics/shared/types";
import {
	type UseQueryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useGlobalSearchParams } from "expo-router";
import fetcher from "#/helpers/fetcher";

export const useInvalidateParticipation = () => {
	const queryClient = useQueryClient();

	return {
		invalidate: async (eventId: string) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["game::participation", eventId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["game::team-members", eventId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["game::participants", eventId],
				}),
			]);
		},
	};
};

export const useParticipateMutation = () => {
	return useMutation({
		mutationFn: (eventId: string) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/participate`,
				{
					method: "POST",
				},
			),
	});
};

export const useAddTeamMemberMutation = () => {
	const eventId = useGlobalSearchParams().eventId?.toString();

	return useMutation({
		mutationFn: (athleteId: string) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/participation/team`,
				{
					method: "POST",
					body: { athleteId },
				},
			),
	});
};

export const useDeleteTeamMemberMutation = () => {
	const eventId = useGlobalSearchParams().eventId?.toString();

	return useMutation({
		mutationFn: (athleteId: string) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/participation/team`,
				{
					method: "DELETE",
					body: { athleteId },
				},
			),
	});
};

export const useMakeTeamLeaderMutation = () => {
	const eventId = useGlobalSearchParams().eventId?.toString();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (athleteId: string) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/make-athlete-captain`,
				{
					method: "POST",
					body: { athleteId },
				},
			),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ["game::team-members", eventId],
			}),
	});
};

export const useDeleteTeamLeaderPrivilegeMutation = () => {
	const eventId = useGlobalSearchParams().eventId?.toString();

	return useMutation({
		mutationFn: (athleteId: string) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/delete-captain-privilege`,
				{
					method: "POST",
					body: { athleteId },
				},
			),
	});
};

export const useCountPointsMutation = () => {
	return useMutation({
		mutationFn: (eventId: string) =>
			fetcher(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/count-points`,
				{
					method: "POST",
				},
			),
	});
};

export const useParticipationQuery = () => {
	const eventId = useGlobalSearchParams().eventId?.toString();

	return useQuery({
		queryKey: ["game::participation", eventId],
		queryFn: () =>
			fetcher<Participant | null>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/participation`,
			),
	});
};

export const useTeamMembersQuery = (
	options?: Omit<
		UseQueryOptions<(Athlete & { isCaptain: boolean, pointsGathered: number })[]>,
		"queryKey" | "queryFn"
	>,
) => {
	const eventId = useGlobalSearchParams().eventId?.toString();

	return useQuery({
		...options,
		queryKey: ["game::team-members", eventId],
		queryFn: () =>
			fetcher<(Athlete & { isCaptain: boolean, pointsGathered: number })[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/participation/team`,
			),
	});
};

export const useParticipantsQuery = () => {
	const eventId = useGlobalSearchParams().eventId?.toString();

	return useQuery({
		queryFn: () =>
			fetcher<UserWithParticipation[]>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${eventId}/participants`,
			),
		queryKey: ["game::participants", eventId],
		enabled: !!eventId,
	});
};

export const useGameSpecificationQuery = (eventId?: string) => {
	const { eventId: defaultEventId } = useGlobalSearchParams();
	const currentEventId = eventId ?? defaultEventId?.toString();

	return useQuery({
		queryFn: () =>
			fetcher<GameSpecification | null>(
				`${process.env.EXPO_PUBLIC_API_URL}/api/v1/game/${currentEventId}/game-specification`
			),
		queryKey: ["game::specification", currentEventId],
		enabled: !!currentEventId,
	})
}