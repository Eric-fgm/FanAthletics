import { Redirect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { Divider, Logo, Typography } from "#/components";
import {
	MagicLinkForm,
	SocialProviders,
	useMagicLinkSignInMutation,
	useSessionSuspeneQuery,
	useSocialSignInMutation,
} from "#/features/auth";

export default function SignIn() {
	const { data: session } = useSessionSuspeneQuery();
	const { mutate: socialSignIn, isPending: isSocialSigningIn } =
		useSocialSignInMutation();
	const { mutate: magicLickSignIn, isPending: isMagicLinkSigningIn } =
		useMagicLinkSignInMutation();

	const isSigningIn = isSocialSigningIn || isMagicLinkSigningIn;

	if (session) {
		return <Redirect href="/" />;
	}

	return (
		<ScrollView contentContainerClassName="h-full">
			{Platform.OS === "web" && (
				<Pressable className="fixed top-6 left-6 z-10">
					<ArrowLeft strokeWidth={1.5} />
				</Pressable>
			)}
			<View className="flex-row h-full">
				<View className="flex-1">
					<View className="flex-1" />
					<View className="px-4 py-8 items-center">
						<Logo namePosition="bottom" nameSize="large" />
						<Typography type="washed" className="mt-1.5">
							Zaloguj się
						</Typography>
						<View className="mt-8 gap-y-6 max-w-sm">
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
				<View className="p-4 flex-1 hidden lg:flex">
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
