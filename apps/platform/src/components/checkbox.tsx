import type React from "react";
import { Pressable, View } from "react-native";

interface CheckboxProps {
	value?: boolean;
	disabled?: boolean;
	className?: string;
	onChangeValue?: (value: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
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
			className={`border border-gray-200 rounded w-4 h-4 overflow-hidden ${className} ${disabled ? "cursor-default opacity-80" : ""}`}
			onPress={handlePress}
			{...props}
		>
			{value && (
				<View className="top-0 left-0 absolute bg-black w-full h-full" />
			)}
		</Pressable>
	);
};

export default Checkbox;
