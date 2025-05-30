import { View } from "react-native";
import { Typography } from "#/components";

interface DividerProps {
	text?: string;
	orientation?: "vertical" | "horizontal";
	color?: keyof typeof colorClassNamesMap;
	className?: string;
}

const colorClassNamesMap = {
	bright: "bg-gray-200",
	dark: "bg-neutral-600",
};

const Divider: React.FC<DividerProps> = ({
	text,
	color = "bright",
	orientation = "horizontal",
	className = "",
}) => {
	const colorClassNames = colorClassNamesMap[color];

	return orientation === "horizontal" ? (
		<View className={`items-center flex-row gap-x-2 ${className}`}>
			<View className={`h-px flex-1 ${colorClassNames}`} />
			{text && (
				<>
					<Typography type="washed">{text}</Typography>
					<View className={`h-px flex-1 ${colorClassNames}`} />
				</>
			)}
		</View>
	) : (
		<View className={`items-center gap-y-2 ${className}`}>
			<View className={`w-px flex-1 ${colorClassNames}`} />
			{text && (
				<>
					<Typography type="washed">{text}</Typography>
					<View className={`w-px flex-1 ${colorClassNames}`} />
				</>
			)}
		</View>
	);
};

export default Divider;
