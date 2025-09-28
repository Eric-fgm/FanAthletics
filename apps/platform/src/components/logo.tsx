import { Link, useRouter } from "expo-router";
import { Image, Platform, Pressable, View } from "react-native";
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
			{/* <Image
				style={{ width: size, height: size }}
				source={require("../../assets/fan-athletics-logo.png")}
			/>
			{namePosition && <Typography size={nameSize}>Olympics</Typography>} */}
			{Platform.OS === "web" && (
				<svg
					width="139"
					height="64"
					viewBox="0 0 139 64"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					className="fill-text-primary w-[43px] h-20 pointer-events-none"
				>
					<title>M</title>
					<path d="M84.3504 64H48.1695V47.315L32.569 63.9989L0 63.9841V29.9515L28.31 0H67.4439V15.9214L82.6881 0H116.593V26.1874H139V64H99.1163V48.208L84.3504 64Z" />
				</svg>
			)}
		</Comp>
	);
};

export default Logo;
