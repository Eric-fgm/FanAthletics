import { Image, Pressable, View } from "react-native";
import { Typography } from "#/components";

interface SocialProvidersProps {
	isLoading: boolean;
	onSelect: (providerId: "google" | "facebook") => void;
}

const SocialProviders: React.FC<SocialProvidersProps> = ({
	isLoading,
	onSelect,
}) => {
	const socialProviders = [
		{
			id: "google",
			name: "Google",
			source: require("../../../../assets/socials/google-icon.svg"),
		},
		{
			id: "facebook",
			name: "Facebook",
			source: require("../../../../assets/socials/facebook-icon.png"),
		},
	] as const;

	return (
		<View className="flex gap-y-4">
			{socialProviders.map(({ id, name, source }) => (
				<Pressable
					key={id}
					disabled={isLoading}
					className="border border-gray-200 rounded-xl flex-row h-12 items-center justify-center gap-x-2 aria-disabled:opacity-65"
					onPress={() => onSelect(id)}
				>
					<Image style={{ width: 20, height: 20 }} source={source} />
					<Typography>Kontynuuj z {name}</Typography>
				</Pressable>
			))}
		</View>
	);
};

export default SocialProviders;
