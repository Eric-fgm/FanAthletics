import { TextInput, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
	disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
	placeholder = "",
	className = "",
	disabled = false,
	...props
}) => {
	return (
		<TextInput
			style={{ fontFamily: "inter-medium" }}
			placeholder={placeholder}
			className={`text-md font-medium px-4 h-12 rounded-xl bg-gray-100 outline-none placeholder:text-gray-400 ${className} ${disabled ? "opacity-50" : ""}`}
			editable={!disabled}
			selectTextOnFocus={!disabled}
			{...props}
		/>
	);
};

export default Input;
