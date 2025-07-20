import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Logo } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import ProfileDropdown from "#/features/navigation/components/profile-dropdown";

const GlobalHeader: React.FC = () => {
	const insest = useSafeAreaInsets();
	const { data: session } = useSessionSuspeneQuery();

	return (
		<View
			style={{ marginTop: insest.top }}
			className="flex-row justify-between items-center bg-white px-4 md:px-8 xl:px-24 w-full h-[72px]"
		>
			<View className="items-start min-w-min">
				<Logo href="/" size={32} namePosition="right" />
			</View>
			{session && (
				<ProfileDropdown
					trigger={
						<Avatar name={session.user.name} image={session.user.image} />
					}
				/>
			)}
		</View>
	);
};

export default GlobalHeader;
