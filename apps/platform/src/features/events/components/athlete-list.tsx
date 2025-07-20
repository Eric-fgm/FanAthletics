import type { Athlete } from "@fan-athletics/shared/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleUser, Ellipsis } from "lucide-react-native";
import type React from "react";
import { useMemo } from "react";
import { Image, View } from "react-native";
import { Dropdown, Table, Typography } from "#/components";

interface AthleteListProps {
	athletes: Athlete[];
}

const AthleteList: React.FC<AthleteListProps> = ({ athletes }) => {
	const { eventId } = useLocalSearchParams();
	const router = useRouter();

	const columns = useMemo(() => {
		return [
			{
				key: "imageUrl",
				name: (
					<View className="basis-2/3">
						<Typography size="small" type="washed">
							Nazwa
						</Typography>
					</View>
				),
				render: ({
					imageUrl,
					firstName,
					lastName,
					coach,
				}: {
					imageUrl: string | null;
					firstName: string;
					lastName: string;
					coach: string;
				}) => (
					<View className="flex-row gap-4 basis-2/3">
						<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12">
							{imageUrl ? (
								<Image source={{ uri: imageUrl }} className="w-full h-full" />
							) : (
								<CircleUser className="w-5 text-gray-600" />
							)}
						</View>
						<View className="justify-center gap-0.5">
							<Typography>
								{firstName} {lastName}
							</Typography>
							<Typography size="small" type="washed">
								{coach}
							</Typography>
						</View>
					</View>
				),
			},
			{
				key: "cost",
				name: "Koszt",
				render: ({ cost }: { cost: number }) => (
					<View>
						<Typography>{cost} XP</Typography>
					</View>
				),
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
										router.push(`/events/${eventId}/athletes/${id}`),
								},
							]}
						/>
					</View>
				),
			},
		];
	}, [eventId, router]);

	return <Table columns={columns} data={athletes} />;
};

export default AthleteList;
