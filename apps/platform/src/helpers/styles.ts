import { Platform } from "react-native";

export const shadow = {
    common: Platform.select({
        ios: {
            shadowColor: "rgba(0,0,0,1)",
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
        },
        android: {
            elevation: 8,
        }
    }),
};