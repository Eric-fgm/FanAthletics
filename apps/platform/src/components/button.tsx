import { Link } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { type TextStyle, View } from "react-native";
import { type GestureResponderEvent, Pressable } from "react-native";
import { Typography } from "#/components";

type ButtonProps = {
	variant?: keyof typeof variantClassNamesMap;
	size?: keyof typeof sizeClassNamesMap;
	rounded?: boolean;
	isLoading?: boolean;
	text?: string;
	textClassName?: string;
	textStyle?: TextStyle;
	icon?: LucideIcon;
	className?: string;
	disabled?: boolean;
} & ({ onPress?: (event: GestureResponderEvent) => void } | { href: string });

const variantClassNamesMap = {
	primary: "bg-gray-900",
	secondary: "bg-gray-100",
	outlined: "border border-gray-200",
	white: "bg-white",
	bright: "bg-[#ededed14]",
	danger: "bg-red-500",
};

const typeClassNameMap = {
	primary: "bright",
	secondary: "dark",
	outlined: "dark",
	bright: "bright",
	white: "dark",
	danger: "bright",
} as const;

const sizeClassNamesMap = {
	small: "px-3 h-9",
	base: "px-5 h-12",
};

const Button: React.FC<ButtonProps> = ({
	text,
	textClassName,
	icon: Icon,
	variant = "primary",
	size = "base",
	rounded = false,
	isLoading = false,
	className = "",
	textStyle,
	disabled,
	...props
}) => {
	const variantClassNames = variantClassNamesMap[variant];
	const sizeClassNames = sizeClassNamesMap[size];
	const typeClassNames = typeClassNameMap[variant];

	const Comp = "href" in props ? View : Pressable;

	return (
		<Comp
			className={`relative flex items-center justify-center flex-shrink-0 gap-2 overflow-hidden ${rounded ? "rounded-full" : "rounded-xl"} ${className} ${variantClassNames} ${sizeClassNames}`}
			disabled={isLoading || disabled}
			{...props}
		>
			{Icon && <Icon size={size === "small" ? 16 : 24} color="white" />}
			{text && (
				<Typography
					style={textStyle}
					type={typeClassNames}
					size={size}
					className={textClassName}
				>
					{text}
				</Typography>
			)}
			{isLoading && (
				<View
					className={`absolute top-0 left-0 w-full h-full flex items-center justify-center ${variantClassNames}`}
				>
					<Typography type={typeClassNames}>...</Typography>
				</View>
			)}
			{"href" in props && (
				<Link
					href={props.href}
					className="top-0 left-0 absolute w-full h-full"
				/>
			)}
		</Comp>
	);
};

export default Button;
