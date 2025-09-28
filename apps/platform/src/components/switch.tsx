import { Pressable, View } from "react-native";
import { Typography } from "#/components";

interface SwitchProps {
	items: { name: string; value: string }[];
	value?: string;
	className?: string;
	onChange?: (value: string) => void;
}

const Switch: React.FC<SwitchProps> = ({
	value,
	items = [],
	className = "",
	onChange,
}) => {
	return (
		<View className={`flex-row gap-1 ${className}`}>
			{items.map((item) => (
				<Pressable
					key={item.value}
					className={`rounded-full px-4 py-2 ${item.value === value ? "bg-gray-100" : "hover:bg-gray-100"}`}
					onPress={() => onChange?.(item.value)}
				>
					<Typography>{item.name}</Typography>
				</Pressable>
			))}
		</View>
	);
};

export default Switch;
