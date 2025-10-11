import { ChevronDown } from "lucide-react-native";
import type React from "react";
import { SelectCountry } from "react-native-element-dropdown";

interface SelectProps {
	items: { name: string; value: string }[];
	value: string | string[];
	placeholder?: string;
	onChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
	items,
	value,
	placeholder,
	onChange,
}) => {
	return (
		<SelectCountry
			style={{
				borderWidth: 1,
				borderColor: "#e5e7eb",
				borderRadius: 9999,
				cursor: "pointer",
			}}
			selectedTextStyle={{
				paddingVertical: 11,
				paddingLeft: 16,
				paddingRight: 8,
				fontSize: 14,
				fontFamily: "inter-medium",
			}}
			imageStyle={{
				display: "none",
			}}
			containerStyle={{
				minWidth: 150,
				borderRadius: 16,
				overflow: "hidden",
			}}
			iconStyle={{
				display: "none",
			}}
			data={items}
			placeholder={placeholder}
			value={value}
			valueField="value"
			labelField="name"
			imageField=""
			onChange={(item) => onChange?.(item.value)}
			renderRightIcon={() => <ChevronDown size={16} className="mr-3" />}
		/>
	);
};

export default Select;
