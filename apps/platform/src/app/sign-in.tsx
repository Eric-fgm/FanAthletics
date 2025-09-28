import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect } from "react";
import {
	AppState,
	Image,
	Platform,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { Divider, Logo, Typography } from "#/components";
import {
	MagicLinkForm,
	SocialProviders,
	useMagicLinkSignInMutation,
	useSessionSuspeneQuery,
	useSocialSignInMutation,
} from "#/features/auth";
import { showToast } from "#/lib/toast";

export default function SignIn() {
	const { data: session, refetch: refetchSession } = useSessionSuspeneQuery();
	const { mutate: socialSignIn, isPending: isSocialSigningIn } =
		useSocialSignInMutation();
	const { mutate: magicLickSignIn, isPending: isMagicLinkSigningIn } =
		useMagicLinkSignInMutation();
	const searchParams = useLocalSearchParams<{ "#"?: string }>();

	if (searchParams["#"]) {
		router.setParams({ "#": "" });
		showToast({
			text1: "Wystąpił Błąd",
			text2: "Nie udało się zalogować",
		});
	}

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (appState) => {
			if (appState === "active") {
				setTimeout(refetchSession, 1000);
			}
		});

		return subscription.remove;
	}, [refetchSession]);

	const isSigningIn = isSocialSigningIn || isMagicLinkSigningIn;

	if (session) {
		return <Redirect href="/" />;
	}

	return (
		<ScrollView contentContainerClassName="h-full">
			{Platform.OS === "web" && (
				<Pressable className="top-6 left-6 z-10 fixed">
					<ArrowLeft strokeWidth={1.5} />
				</Pressable>
			)}
			<View className="flex-row h-full">
				<View className="flex-1">
					<View className="flex-1" />
					<View className="items-center px-4 py-8">
						<Logo namePosition="bottom" />
						<Typography type="washed" className="mt-1.5">
							Zaloguj się
						</Typography>
						<View className="gap-y-6 mt-8 max-w-sm">
							<SocialProviders
								isLoading={isSigningIn}
								onSelect={(providerId) => socialSignIn(providerId)}
							/>
							<Divider text="Lub" />
							<MagicLinkForm
								isLoading={isSigningIn}
								onSubmit={({ email }) => magicLickSignIn(email)}
							/>
						</View>
					</View>
					<View className="flex-1" />
				</View>
				<View className="hidden lg:flex flex-1 p-4">
					<Image
						style={{ width: "100%", height: "100%" }}
						source={require("../../assets/banners/sign-in-banner.png")}
						className="rounded-3xl"
					/>
				</View>
			</View>
		</ScrollView>
	);
}
