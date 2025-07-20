import { Check, X } from "lucide-react-native";
import type React from "react";
import { Pressable, View } from "react-native";

interface ToggleProps {
	value?: boolean;
	disabled?: boolean;
	className?: string;
	onChangeValue?: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({
	value,
	disabled,
	className = "",
	onChangeValue,
	...props
}) => {
	const handlePress = () => {
		if (disabled || !onChangeValue || typeof value !== "boolean") {
			return;
		}

		onChangeValue(!value);
	};

	return (
		<Pressable
			className={`rounded-full w-12 h-8 overflow-hidden ${className} ${value ? "bg-black" : "bg-gray-100"} ${disabled ? "cursor-default opacity-80" : ""}`}
			onPress={handlePress}
			{...props}
		>
			<View
				className={`absolute items-center justify-center top-1 bg-white rounded-full w-6 h-6 ${value ? "right-1" : "left-1"}`}
			>
				{value ? (
					<Check size={16} className="text-gray-black" />
				) : (
					<X size={16} className="text-gray-500" />
				)}
			</View>
		</Pressable>
	);
};

export default Toggle;
