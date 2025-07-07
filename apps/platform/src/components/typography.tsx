import { Text } from "react-native";

interface TypographyProps extends React.PropsWithChildren {
	size?: keyof typeof sizeClassNamesMap;
	type?: keyof typeof typeClassNamesMap;
	className?: string;
}

const sizeClassNamesMap = {
	raw: "",
	normal: "text-md",
	small: "text-xs",
	medium: "text-base",
	large: "text-lg",
	large2: "text-2xl",
	large3: "text-3xl",
	large4: "text-4xl",
	"large4.5": "text-4.5xl",
	large5: "text-5xl",
};

const weightClassNamesMap = {
	raw: "inter-medium",
	normal: "inter-medium",
	small: "inter-medium",
	medium: "inter-semibold",
	large: "inter-semibold",
	large2: "inter-semibold",
	large3: "inter-semibold",
	large4: "inter-semibold",
	"large4.5": "inter-semibold",
	large5: "inter-bold",
};

const typeClassNamesMap = {
	dark: "text-black",
	bright: "text-white",
	washed: "text-gray-600",
	"washed-bright": "text-gray-300",
	inherit: "text-inherit",
	danger: "text-red-600",
};

const Typography: React.FC<TypographyProps> = ({
	children,
	size = "normal",
	type = "dark",
	className = "",
}) => {
	const sizeClassNames = sizeClassNamesMap[size];
	const weightClassNames = weightClassNamesMap[size];
	const typeClassNames = typeClassNamesMap[type];

	return (
		<Text
			style={{ fontFamily: weightClassNames }}
			className={`tracking-tight ${sizeClassNames} ${typeClassNames} ${className}`}
		>
			{children}
		</Text>
	);
};

export default Typography;
