import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
	useFonts,
} from "@expo-google-fonts/inter";
import { Slot } from "expo-router";
import { Suspense } from "react";
import { Typography } from "#/components";
import { QueryProvider } from "#/lib/react-query";
import "#/styles/global.css";

const AppLayout = () => {
	useFonts({
		"inter-regular": Inter_400Regular,
		"inter-medium": Inter_500Medium,
		"inter-semibold": Inter_600SemiBold,
		"inter-bold": Inter_700Bold,
	});

	return (
		<QueryProvider>
			<Suspense fallback={<Typography>Loading...</Typography>}>
				<Slot />
			</Suspense>
		</QueryProvider>
	);
};

export default AppLayout;
