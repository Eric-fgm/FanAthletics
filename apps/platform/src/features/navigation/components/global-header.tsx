import { Bell, Search } from "lucide-react-native";
import { View } from "react-native";
import { Avatar, Button, Logo } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import ProfileDropdown from "#/features/navigation/components/profile-dropdown";

const GlobalHeader: React.FC = () => {
	const { data: session } = useSessionSuspeneQuery();

	return (
		<View className="px-4 md:px-8 xl:px-24 grid w-full grid-cols-[1fr_1fr] grid-rows-1 bg-white items-center gap-x-8 md:grid-cols-[1fr_minmax(auto,520px)_1fr] h-[72px]">
			<View className="min-w-min items-start">
				<Logo href="/" size={32} namePosition="right" />
			</View>
			<View className="h-12 rounded-full bg-gray-100 hidden md:flex" />
			<View className="min-w-min flex-row gap-x-6 items-center justify-end">
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
