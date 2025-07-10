import Toast, { type ToastShowParams } from "react-native-toast-message";

const defaultOptions = {
	text1Style: {
		fontFamily: "inter-medium",
		fontSize: 13,
		marginBottom: 4,
	},
	text2Style: {
		fontFamily: "inter-medium",
		fontSize: 12,
	},
};

export const showToast = (options: ToastShowParams) => {
	Toast.show({
		type: "success",
		...defaultOptions,
		...options,
	});
};
