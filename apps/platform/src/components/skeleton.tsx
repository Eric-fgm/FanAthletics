import type React from "react";
import { useEffect, useRef } from "react";
import { Animated, Platform, View, type ViewProps } from "react-native";

const Skeleton: React.FC<ViewProps> = ({ className = "", ...props }) => {
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const loopAnimation = () => {
			shimmerAnim.setValue(0);
			Animated.timing(shimmerAnim, {
				toValue: 1,
				duration: 1400,
				useNativeDriver: true,
			}).start(() => loopAnimation());
		};

		loopAnimation();
	}, [shimmerAnim]);

	return (
		<View
			className={`bg-gray-100 rounded-md overflow-hidden ${className}`}
			{...props}
		>
			<Animated.View
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					height: "100%",
					width: "100%",
					transform: [
						{
							translateX: shimmerAnim.interpolate({
								inputRange: [0, 1],
								outputRange: ["-100%", "100%"],
							}),
						},
					],
				}}
			>
				<View
					className="bg-gray-50 w-1/2 h-full"
					style={{
						...(Platform.OS === "web" && {
							background: "linear-gradient(90deg, #F3F4F6, #FAFAFD, #F3F4F6)",
						}),
					}}
				/>
			</Animated.View>
		</View>
	);
};

export default Skeleton;
