import { Link } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { type GestureResponderEvent, Pressable } from "react-native";
import { Typography } from "#/components";

type ButtonProps = {
	variant?: keyof typeof variantClassNamesMap;
	size?: keyof typeof sizeClassNamesMap;
	rounded?: boolean;
	isLoading?: boolean;
	text: string;
	icon?: LucideIcon;
	className?: string;
} & ({ onPress?: (event: GestureResponderEvent) => void } | { href: string });

const variantClassNamesMap = {
	primary: "bg-gray-900",
	outlined: "border border-gray-200",
	white: "bg-white",
	bright: "bg-[#ededed14]",
};

const typeClassNameMap = {
	primary: 'bright',
	outlined: 'dark',
	bright: 'bright',
	white: 'dark',
} as const

const sizeClassNamesMap = {
	small: "px-4 py-2.5",
	normal: "px-5 h-12",
};

const Button: React.FC<ButtonProps> = ({
	text,
	icon: IconComp,
	variant = "primary",
	size = "normal",
	rounded = false,
	isLoading = false,
	className = "",
	...props
}) => {
	const variantClassNames = variantClassNamesMap[variant];
	const sizeClassNames = sizeClassNamesMap[size];
	const typeClassNames = typeClassNameMap[variant]

	const Comp = "href" in props ? Link : Pressable;

	return (
		<Comp
			className={`relative flex items-center justify-center flex-shrink-0 gap-2 overflow-hidden ${rounded ? "rounded-full" : "rounded-xl"} ${className} ${variantClassNames} ${sizeClassNames}`}
			disabled={isLoading}
			{...(props as { href: string })}
		>
			{IconComp && <IconComp />}
			<Typography
				type={typeClassNames}
				size={size}
			>
				{text}
			</Typography>
			{isLoading && (
				<View
					className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${variantClassNames}`}
				>
					<Typography type="inherit">...</Typography>
				</View>
			)}
		</Comp>
	);
};

export default Button;
