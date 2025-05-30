import { Link } from "expo-router";
import { Image, View } from "react-native";
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
	nameSize = "medium",
}) => {
	const Comp = href ? Link : View;

	return (
		<Comp
			href={href as string}
			className={`flex items-center gap-y-4 gap-x-2 ${namePosition === "right" && "flex-row"} ${className}`}
		>
			<Image
				style={{ width: size, height: size }}
				source={require("../../assets/fan-athletics-logo.svg")}
			/>
			{namePosition && <Typography size={nameSize}>Olympics</Typography>}
		</Comp>
	);
};

export default Logo;
