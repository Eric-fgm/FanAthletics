import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			structuralSharing: false,
			retry: false,
		},
	},
});

export const QueryProvider = (props: React.PropsWithChildren) => {
	return <QueryClientProvider client={queryClient} {...props} />;
};
