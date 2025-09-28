import { View } from "react-native";
import { Select, Typography } from "#/components";
import { DisciplineList, useEventDiscpilinesQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventDisciplines() {
	const { data: disciplines = [], isLoading } = useEventDiscpilinesQuery();

	return (
		<ScrollArea>
			<Header title="Dyscypliny" />
			<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
				<View className="flex-row items-center gap-2">
					<Typography size="large2">Trending</Typography>
					<Typography
						size="small"
						className="flex justify-center items-center bg-gray-100 rounded-full w-6 h-6"
					>
						{disciplines.length}
					</Typography>
				</View>
				<Select />
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
