import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { showToast } from "./toast";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			structuralSharing: false,
			retry: false,
		},
		mutations: {
			onError(error) {
				showToast({
					text1: "Wystąpił błąd",
					text2: error.message ?? "Spróbuj ponownie później",
				});
			},
		},
	},
});

export const QueryProvider = (props: React.PropsWithChildren) => {
	return <QueryClientProvider client={queryClient} {...props} />;
};
