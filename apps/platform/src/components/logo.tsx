import { useRouter } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { Typography } from "#/components";

interface LogoProps {
	size?: number;
	href?: string;
	namePosition?: "bottom" | "right";
	nameSize?: "medium" | "large";
	className?: string;
}

const Logo: React.FC<LogoProps> = ({
	href,
	size = 40,
	className = "",
	namePosition,
	nameSize = "large",
}) => {
	const router = useRouter();

	const Comp = href ? Pressable : View;

	return (
		<Comp
			className={`flex items-center gap-y-4 gap-x-2 ${namePosition === "right" && "flex-row"} ${className}`}
			onPress={href ? () => router.dismissTo(href) : undefined}
		>
			<Image
				style={{ width: size, height: size }}
				source={require("../../assets/fan-athletics-logo.png")}
			/>
			{namePosition && <Typography size={nameSize}>FanAthletics</Typography>}
		</Comp>
	);
};

export default Logo;
