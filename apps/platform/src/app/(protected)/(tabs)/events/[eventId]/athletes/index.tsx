import { ScrollView, View } from "react-native";
import { Button, Divider, Switch, Typography } from "#/components";
import { AthleteList, useEventAthletesQuery } from "#/features/events";

export default function EventAthletes() {
	const { data: athletes = [] } = useEventAthletesQuery();

	return (
		<ScrollView className="px-4 md:px-8 xl:px-24 py-8">
			<Typography size="large4.5">Zawodnicy</Typography>
			<View className="gap-8 mt-6">
				<View className="flex-row items-center gap-4">
					<Switch
						items={[
							{ name: "Wszystkie", value: "all" },
							{ name: "Aktywne", value: "active" },
						]}
						value="all"
					/>
					<Divider orientation="vertical" className="h-8" />
					<Button variant="outlined" text="Druźyna" className="!h-11" rounded />
					<Button
						variant="outlined"
						text="Najnowsze"
						className="!h-11"
						rounded
					/>
				</View>
				<AthleteList athletes={athletes} />
			</View>
		</ScrollView>
	);
}
