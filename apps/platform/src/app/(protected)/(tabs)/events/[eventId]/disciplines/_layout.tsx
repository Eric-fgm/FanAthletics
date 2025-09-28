import { Stack } from "expo-router";

const DisciplinesLayout = () => {
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

export default DisciplinesLayout;
