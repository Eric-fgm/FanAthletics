import { View } from "react-native";
import { Typography } from "#/components";
import { LeaderboardList, useEventQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";
import { useParticipantsQuery } from "#/features/participation";
import EventHeader from "#/components/event-header";

export default function EventLeaderboard() {
	const { data: usersWithParticipation = [], isLoading } =
		useParticipantsQuery();
	const { data: event, isLoading: isEventLoading } = useEventQuery();

	// ODŚWIEŻANIE WYNIKÓW!!!
	// Coś jest nie tak, jak kliknę oblicz punkty bez zaciągniętych danych - zwraca 401 Unauthorized
	// Chyba trzeba zrobić to invalidateQueries

	return (
		<ScrollArea>
			<EventHeader event={event} />
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
