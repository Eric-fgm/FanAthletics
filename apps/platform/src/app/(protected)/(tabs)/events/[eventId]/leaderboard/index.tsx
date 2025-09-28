import { View } from "react-native";
import { Typography } from "#/components";
import { LeaderboardList } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";
import { useParticipantsQuery } from "#/features/participation";

export default function EventLeaderboard() {
	const { data: usersWithParticipation = [], isLoading } =
		useParticipantsQuery();

	return (
		<ScrollArea>
			<Header title="Wyniki" />
			<View className="px-4 lg:px-12 pt-12 pb-4">
				<View className="flex-row items-end gap-x-2">
					<Typography size="large2">Odświeżono</Typography>
					<Typography size="large1" type="washed">
						3 dni temu
					</Typography>
				</View>
				<Typography
					size="base"
					style={{ fontFamily: "inter-semibold" }}
					className="mt-6"
				>
					ETH volume
				</Typography>
			</View>
			<View className="px-4 lg:px-12">
				<LeaderboardList
					users={usersWithParticipation}
					placeholder={isLoading && <LeaderboardList.Skeleton />}
				/>
			</View>
		</ScrollArea>
	);
}
