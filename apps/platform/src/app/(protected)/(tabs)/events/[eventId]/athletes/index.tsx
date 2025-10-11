import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Select, Typography } from "#/components";
import { AthleteList, useAthletesQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventAthletes() {
	const { sortBy = "" } = useLocalSearchParams();

	const { data: athletes = [], isLoading } = useAthletesQuery({
		sortBy: sortBy.toString(),
	});

	return (
		<ScrollArea>
			<Header title="Zawodnicy" />
			<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
				<View className="flex-row items-center gap-2">
					<Typography size="large2">Lista</Typography>
					<View className="flex justify-center items-center bg-gray-100 px-1.5 rounded-full h-6">
						<Typography size="small" className="!text-[10px]">
							{athletes.length < 100 ? athletes.length : "99+"}
						</Typography>
					</View>
				</View>
				<Select
					items={[
						{ name: "Domyślnie", value: "" },
						{ name: "Koszt", value: "cost" },
					]}
					value={sortBy}
					onChange={(value) =>
						router.setParams({ sortBy: value ? value : undefined })
					}
				/>
			</View>
			<View className="px-4 lg:px-12">
				<AthleteList
					athletes={athletes}
					placeholder={isLoading && <AthleteList.Skeleton />}
				/>
			</View>
		</ScrollArea>
	);
}
