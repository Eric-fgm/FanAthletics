import { Text } from "react-native";

interface TypographyProps extends React.ComponentProps<typeof Text> {
	size?: keyof typeof sizeClassNamesMap;
	type?: keyof typeof typeClassNamesMap;
	className?: string;
}

const sizeClassNamesMap = {
	raw: "",
	small: "text-xs -tracking-[0.1px]",
	medium: "text-sm -tracking-[0.1px]",
	base: "text-base -tracking-[0.1px]",
	large: "text-lg tracking-tight",
	large1: "text-xl tracking-tight",
	large2: "text-2xl tracking-tight",
	large3: "text-3xl tracking-tight",
	large4: "text-4xl tracking-tight",
	"large4.5": "text-4.5xl tracking-tight",
	large5: "text-5xl tracking-tight",
	large6:
		"text-[38px] -tracking-[0.03em] leading-[40px] lg:text-[60px] lg:leading-[64px]",
	large7: "text-7xl tracking-tight",
	large8: "text-8xl tracking-tight",
};

const weightClassNamesMap = {
	raw: undefined,
	small: "inter-medium",
	medium: "inter-medium",
	base: "inter-medium",
	large: "inter-medium",
	large1: "inter-medium",
	large2: "inter-medium",
	large3: "inter-semibold",
	large4: "inter-semibold",
	"large4.5": "inter-semibold",
	large5: "inter-semibold",
	large6: "inter-semibold",
	large7: "inter-semibold",
	large8: "inter-semibold",
};

const typeClassNamesMap = {
	dark: "text-black",
	bright: "text-white",
	washed: "text-gray-500",
	"washed-bright": "text-gray-300",
	inherit: "text-inherit",
	danger: "text-red-600",
};

const Typography: React.FC<TypographyProps> = ({
	children,
	style,
	size = "medium",
	type = "dark",
	className = "",
	...props
}) => {
	const sizeClassNames = sizeClassNamesMap[size];
	const weightClassNames = weightClassNamesMap[size];
	const typeClassNames = typeClassNamesMap[type];

	return (
		<Text
			style={style ? style : { fontFamily: weightClassNames }}
			className={`${sizeClassNames} ${typeClassNames} ${className}`}
			{...props}
		>
			{children}
		</Text>
	);
};

export default Typography;
