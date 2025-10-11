import { router, usePathname } from "expo-router";
import { Bell, ChevronLeft, Search } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Logo } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import ProfileDropdown from "#/features/layout/components/profile-dropdown";

const GlobalHeader: React.FC = () => {
	const insest = useSafeAreaInsets();
	const { data: session } = useSessionSuspeneQuery();
	const pathname = usePathname();

	return (
		<View
			style={{ marginTop: insest.top }}
			className="flex-row justify-between items-center bg-white px-4 md:px-8 xl:px-24 pt-5 pb-4 w-full"
		>
			{pathname === "/" ? (
				<Logo size={32} />
			) : (
				<Pressable
					onPress={() => {
						if (router.canGoBack()) {
							router.back();
						} else {
							router.replace("/");
						}
					}}
					className="lg:hidden flex justify-center items-center border border-gray-200 rounded-full w-9 h-9"
				>
					<ChevronLeft size={16} />
				</Pressable>
			)}
			<View className="flex-row gap-4">
				<View className="flex-row gap-x-2">
					<View className="lg:hidden flex justify-center items-center border border-gray-200 rounded-full w-9 h-9">
						<Search size={16} />
					</View>
					<View className="justify-center items-center border border-gray-200 rounded-full w-9 h-9">
						<Bell size={16} />
					</View>
				</View>
				{session && (
					<ProfileDropdown
						trigger={
							<Avatar name={session.user.name} image={session.user.image} />
						}
					/>
				)}
			</View>
		</View>
	);
};

export default GlobalHeader;
