import { View } from "react-native";
import { Typography } from "#/components";
import { LeaderboardList } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";
import {
	useParticipantsQuery,
	useParticipationQuery,
} from "#/features/participation";
import { diffDays } from "#/helpers/date";

export default function EventLeaderboard() {
	const { data: participation } = useParticipationQuery();
	const { data: usersWithParticipation = [], isLoading } =
		useParticipantsQuery();

	const days = participation
		? diffDays(participation.updatedAt, new Date())
		: 0;

	return (
		<ScrollArea>
			<Header title="Wyniki" />
			<View className="px-4 lg:px-12 pt-12 pb-4">
				<View className="flex-row items-end gap-x-2">
					<Typography size="large2">Odświeżono</Typography>
					{participation && (
						<Typography size="large1" type="washed">
							{days > 0 ? `${days} dni temu` : "Dzisiaj"}
						</Typography>
					)}
				</View>
				<Typography
					size="base"
					style={{ fontFamily: "inter-semibold" }}
					className="mt-6"
				>
					Lista graczy
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
