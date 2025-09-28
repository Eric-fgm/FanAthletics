import { ChevronDown } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Typography } from "#/components";

const Select = () => {
	return (
		<View className="flex-row items-center gap-2 px-4 py-2 border border-gray-200 rounded-full">
			<Typography>Najnowsze</Typography>
			<ChevronDown size={16} />
		</View>
	);
};

export default Select;
