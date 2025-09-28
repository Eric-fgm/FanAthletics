import type { Discipline } from "@fan-athletics/shared/types";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import type React from "react";
import { useMemo } from "react";
import { View } from "react-native";
import { Dropdown, Skeleton, Table, Typography } from "#/components";
import { getDisciplineIcon } from "../helpers";

interface DisciplineListProps {
	disciplines: Discipline[];
	placeholder?: React.ReactNode;
}

const DisciplineList: React.FC<DisciplineListProps> & {
	Skeleton: typeof DisciplineListSkeleton;
} = ({ disciplines, ...props }) => {
	const { eventId } = useLocalSearchParams();
	const router = useRouter();

	const columns = useMemo(() => {
		return [
			{
				key: "name",
				render: ({
					id,
					icon,
					name,
					record,
				}: {
					id: string;
					icon: string;
					name: string;
					record: string | null;
				}) => {
					const Icon = getDisciplineIcon(icon);
					return (
						<View className="flex-row gap-4">
							<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12">
								<Icon className="w-5 text-gray-500" />
							</View>
							<View className="justify-center gap-0.5">
								<Link href={`/events/${eventId}/disciplines/${id}`}>
									<Typography size="base">{name}</Typography>
								</Link>
								<Typography type="washed">
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

	return <Table columns={columns} data={disciplines} {...props} />;
};

const DisciplineListSkeleton: React.FC<{ rowsCount?: number }> = ({
	rowsCount = 4,
}) => {
	return (
		<View>
			{Array.from({ length: rowsCount }).map((_, index) => (
				<View
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={index}
					className="flex-row items-center px-5 border-gray-200 last:border-0 border-b h-[86px]"
				>
					<View className="flex-row items-center gap-4 basis-[72%] xl:basis-1/3">
						<Skeleton className="!rounded-full w-12 h-12" />
						<View className="gap-2">
							<Skeleton className="w-36 h-5" />
							<Skeleton className="w-24 h-4" />
						</View>
					</View>
					<Skeleton className="w-24 h-5" />
				</View>
			))}
		</View>
	);
};

DisciplineList.Skeleton = DisciplineListSkeleton;

export default DisciplineList;
