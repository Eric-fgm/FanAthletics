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
		<View className={`p-1 flex-row bg-gray-100 rounded-full ${className}`}>
			{items.map((item) => (
				<Pressable
					key={item.value}
					className={`rounded-full px-4 py-2 ${item.value === value && "bg-white"}`}
					onPress={() => onChange?.(item.value)}
				>
					<Typography
						type={item.value === value ? "dark" : "washed"}
						className="leading-5"
					>
						{item.name}
					</Typography>
				</Pressable>
			))}
		</View>
	);
};

export default Switch;
