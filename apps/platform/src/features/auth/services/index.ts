import type { User } from "@fan-athletics/shared/types";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { CALLBACK_URL } from "#/helpers/constants";
import authClient from "#/lib/auth-client";
import { showToast } from "#/lib/toast";

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
			showToast({text1: 'Profile Updated', text2: 'Your profile changes were saved'})
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
		mutationFn: async (email: string) => {
				const {data, error}=await authClient.signIn.magicLink({
				email,
				callbackURL: CALLBACK_URL,
			})

			if (error) {
				throw new Error(error.message)
			}
			return data
		},
		onSuccess() {
			showToast({text1: 'Email has been sent', text2: 'Check your email box'})
		},
	});
};
