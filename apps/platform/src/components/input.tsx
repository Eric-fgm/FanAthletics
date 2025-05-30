import { TextInput, type TextInputProps } from "react-native";

const Input: React.FC<TextInputProps> = ({
	placeholder = "",
	className = "",
	...props
}) => {
	return (
		<TextInput
			style={{ fontFamily: "inter-medium" }}
			placeholder={placeholder}
			className={`text-md font-medium px-4 h-12 rounded-xl bg-gray-100 outline-none placeholder:text-gray-400 ${className}`}
			{...props}
		/>
	);
};

export default Input;
