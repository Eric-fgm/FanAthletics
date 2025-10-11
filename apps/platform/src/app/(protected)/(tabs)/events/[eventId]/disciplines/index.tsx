import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Select, Typography } from "#/components";
import { DisciplineList, useDisciplinesQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventDisciplines() {
	const { sortBy = "" } = useLocalSearchParams();

	const { data: disciplines = [], isLoading } = useDisciplinesQuery({
		sortBy: sortBy.toString(),
	});

	return (
		<ScrollArea>
			<Header title="Dyscypliny" />
			<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
				<View className="flex-row items-center gap-2">
					<Typography size="large2">Lista</Typography>
					<View className="flex justify-center items-center bg-gray-100 px-1.5 rounded-full h-6">
						<Typography size="small" className="!text-[10px]">
							{disciplines.length < 100 ? disciplines.length : "99+"}
						</Typography>
					</View>
				</View>
				<Select
					items={[
						{ name: "Domyślnie", value: "" },
						{ name: "Nazwa", value: "name" },
					]}
					value={sortBy}
					onChange={(value) =>
						router.setParams({ sortBy: value ? value : undefined })
					}
				/>
			</View>
			<View className="px-4 lg:px-12">
				<DisciplineList
					disciplines={disciplines}
					placeholder={isLoading && <DisciplineList.Skeleton />}
				/>
			</View>
		</ScrollArea>
	);
}
