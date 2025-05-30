import type { User } from "@fan-athletics/shared/types";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { CALLBACK_URL } from "#/helpers/constants";
import authClient from "#/lib/auth-client";

export const useSessionSuspeneQuery = () => {
	const { data, ...restQuery } = useSuspenseQuery({
		queryFn: () => authClient.getSession(),
		queryKey: ["auth::session"],
	});

	return {
		data: (data?.data ?? null) as { user: User } | null,
		...restQuery,
	};
};

export const useCurrentUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (
			values: Partial<{
				name: string;
				note: string;
			}>,
		) => authClient.updateUser(values),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["auth::session"] });
		},
	});
};

export const useSignOutMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => authClient.signOut(),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["auth::session"] });
		},
	});
};

export const useSocialSignInMutation = () => {
	return useMutation({
		mutationFn: (provider: "google" | "facebook") =>
			authClient.signIn.social({
				provider,
				callbackURL: CALLBACK_URL,
				errorCallbackURL: CALLBACK_URL,
			}),
	});
};

export const useMagicLinkSignInMutation = () => {
	return useMutation({
		mutationFn: (email: string) =>
			authClient.signIn.magicLink({
				email,
				callbackURL: CALLBACK_URL,
			}),
	});
};
