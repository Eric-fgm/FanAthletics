import { Link, router, useGlobalSearchParams } from "expo-router";
import { Bell, ChevronDown, Search } from "lucide-react-native";
import { View } from "react-native";
import { Avatar, Button, Dropdown, Logo, Typography } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import ProfileDropdown from "#/features/layout/components/profile-dropdown";

const GlobalHeader: React.FC = () => {
	const { data: session } = useSessionSuspeneQuery();
	const { eventId } = useGlobalSearchParams();

	return (
		<View className="items-center gap-x-8 grid grid-cols-[1fr_1fr] lg:grid-cols-[1fr_minmax(auto,520px)_1fr] grid-rows-1 bg-white px-4 lg:px-12 w-full h-16">
			<View className="flex-row items-center gap-6 min-w-min">
				<Logo href="/" size={32} namePosition="right" />
				<View
					className={`hidden lg:flex flex-row ${eventId ? "" : "pointer-events-none"}`}
				>
					<Typography className="px-4 py-2">
						<Link href={`/events/${eventId}`}>Aktualności</Link>
					</Typography>
					<Dropdown
						trigger={
							<View className="flex-row items-center gap-1 px-4 py-2">
								<Typography>Trending</Typography>
								<ChevronDown size={16} />
							</View>
						}
						className="mt-2"
						items={[
							{
								name: "Tabela wyników",
								onPress: () => router.push(`/events/${eventId}/leaderboard`),
							},
							{
								name: "Dyscypliny",
								onPress: () => router.push(`/events/${eventId}/disciplines`),
							},
							{
								name: "Zawodnicy",
								onPress: () => router.push(`/events/${eventId}/athletes`),
							},
							{
								name: "Twoja druzyna",
								onPress: () => router.push(`/events/${eventId}/participation`),
							},
						]}
					/>
				</View>
			</View>
			<View className="hidden lg:flex bg-gray-100 rounded-full h-12" />
			<View className="flex-row justify-end items-center gap-x-4 min-w-min">
				<View className="flex-row gap-x-2">
					<View className="lg:hidden flex justify-center items-center border border-gray-200 rounded-full w-9 h-9">
						<Search size={16} />
					</View>
					<View className="justify-center items-center border border-gray-200 rounded-full w-9 h-9">
						<Bell size={16} />
					</View>
				</View>
				<Button
					href="/"
					text="Dołącz"
					size="small"
					className="hidden lg:flex"
					textStyle={{ fontFamily: "inter-regular", letterSpacing: 0.1 }}
					textClassName="!text-sm"
					rounded
				/>
				{session && (
					<ProfileDropdown
						trigger={
							<Avatar name={session.user.name} image={session.user.image} />
						}
						className="mt-4"
					/>
				)}
			</View>
		</View>
	);
};

export default GlobalHeader;
