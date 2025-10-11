import {
	Inter_400Regular,
	Inter_500Medium,
	Inter_600SemiBold,
	Inter_700Bold,
	useFonts,
} from "@expo-google-fonts/inter";
import { PortalProvider } from "@gorhom/portal";
import { Slot, SplashScreen } from "expo-router";
import { Suspense, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Typography } from "#/components";
import { QueryProvider } from "#/lib/react-query";
import "#/styles/global.css";

SplashScreen.preventAutoHideAsync();

const AppLayout = () => {
	const [loaded] = useFonts({
		"inter-regular": Inter_400Regular,
		"inter-medium": Inter_500Medium,
		"inter-semibold": Inter_600SemiBold,
		"inter-bold": Inter_700Bold,
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hide();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<GestureHandlerRootView>
			<SafeAreaProvider>
				<QueryProvider>
					<PortalProvider>
						<Suspense fallback={<Typography>Loading...</Typography>}>
							<Slot />
						</Suspense>
						<Toast position="bottom" />
					</PortalProvider>
				</QueryProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
};

export default AppLayout;
