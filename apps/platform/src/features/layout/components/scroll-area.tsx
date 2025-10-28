import type React from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

const ScrollArea: React.FC<ScrollViewProps> = ({
	className = "",
	...props
}) => {
	return <ScrollView contentContainerClassName={`${className}`} {...props} />;
};

export default ScrollArea;
