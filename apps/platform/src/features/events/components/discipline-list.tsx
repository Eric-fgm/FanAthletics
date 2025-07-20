import type { Discipline } from "@fan-athletics/shared/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import type React from "react";
import { useMemo } from "react";
import { View } from "react-native";
import { Dropdown, Table, Typography } from "#/components";
import { getDisciplineIcon } from "../helpers";

interface DisciplineListProps {
	disciplines: Discipline[];
}

const DisciplineList: React.FC<DisciplineListProps> = ({ disciplines }) => {
	const { eventId } = useLocalSearchParams();
	const router = useRouter();

	const columns = useMemo(() => {
		return [
			{
				key: "name",
				name: "Nazwa",
				render: ({
					icon,
					name,
					record,
				}: { icon: string; name: string; record: string | null }) => {
					const Icon = getDisciplineIcon(icon);
					return (
						<View className="flex-row gap-4">
							<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12">
								<Icon className="w-5 text-gray-500" />
							</View>
							<View className="justify-center gap-0.5">
								<Typography>{name}</Typography>
								<Typography size="small" type="washed">
									{record !== "-" ? `Rekord - ${record}` : "Brak informacji"}
								</Typography>
							</View>
						</View>
					);
				},
			},
			{
				key: "action",
				name: "",
				render: ({ id }: { id: string }) => (
					<View className="ml-auto">
						<Dropdown
							className="!mt-2"
							trigger={
								<View className="justify-center items-center hover:bg-gray-100 rounded-full w-8 h-8">
									<Ellipsis size={20} />
								</View>
							}
							items={[
								{
									name: "Zobacz więcej",
									onPress: () =>
										router.push(`/events/${eventId}/disciplines/${id}`),
								},
							]}
						/>
					</View>
				),
			},
		];
	}, [eventId, router]);

	return <Table columns={columns} data={disciplines} />;
};

export default DisciplineList;
