import { View } from "react-native";
import { Logo } from "#/components";

interface HeaderProps {
	steps: number;
}

const Header: React.FC<HeaderProps> = ({ steps }) => {
	return (
		<View className="flex-row items-center h-[72px]">
			<View className="flex-1">
				<Logo size={32} namePosition="right" />
			</View>
			<View className="w-40 h-1.5 rounded-md overflow-hidden bg-gray-100">
				<View
					style={{ width: `${steps * 100}%` }}
					className="h-full bg-gray-900"
				/>
			</View>
			<View className="flex-1 hidden md:flex" />
		</View>
	);
};

export default Header;
