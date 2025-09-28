import { Stack } from "expo-router";

const AthletesLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: "#ffffff",
				},
			}}
		/>
	);
};

export default AthletesLayout;
