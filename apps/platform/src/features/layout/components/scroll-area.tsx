import type React from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

const ScrollArea: React.FC<ScrollViewProps> = ({
	className = "",
	...props
}) => {
	return (
		<ScrollView
			contentContainerClassName={`px-4 md:px-8 xl:px-24 py-8 ${className}`}
			{...props}
		/>
	);
};

export default ScrollArea;
