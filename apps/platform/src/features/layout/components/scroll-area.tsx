import type React from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

const ScrollArea: React.FC<ScrollViewProps> = ({
	className = "",
	...props
}) => {
	return (
		<ScrollView
			contentContainerClassName={`pt-12 lg:pt-16 pb-8 ${className}`}
			{...props}
		/>
	);
};

export default ScrollArea;
