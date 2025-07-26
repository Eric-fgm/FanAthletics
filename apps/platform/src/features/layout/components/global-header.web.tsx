import { Bell, Search } from "lucide-react-native";
import { View } from "react-native";
import { Avatar, Button, Logo } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import ProfileDropdown from "#/features/layout/components/profile-dropdown";

const GlobalHeader: React.FC = () => {
	const { data: session } = useSessionSuspeneQuery();

	return (
		<View className="items-center gap-x-8 grid grid-cols-[1fr_1fr] md:grid-cols-[1fr_minmax(auto,520px)_1fr] grid-rows-1 bg-white px-4 md:px-8 xl:px-24 w-full h-[72px]">
			<View className="items-start min-w-min">
				<Logo href="/" size={32} namePosition="right" />
			</View>
			<View className="hidden md:flex bg-gray-100 rounded-full h-12" />
			<View className="flex-row justify-end items-center gap-x-6 min-w-min">
				<View className="p-1">
					<Search size={18} />
				</View>
				<View className="p-1">
					<Bell size={18} />
				</View>
				<Button
					href="/"
					text="Dołącz"
					size="small"
					className="hidden lg:flex"
					rounded
				/>
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
