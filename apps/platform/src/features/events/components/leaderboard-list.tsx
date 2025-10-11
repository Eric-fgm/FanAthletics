import type {
	Athlete,
	UserWithParticipation,
} from "@fan-athletics/shared/types";
import { Link, useRouter } from "expo-router";
import { CircleUser, Ellipsis } from "lucide-react-native";
import type React from "react";
import { useMemo } from "react";
import { Image, View } from "react-native";
import { Avatar, Dropdown, Skeleton, Table, Typography } from "#/components";

interface LeaderboardListProps {
	users: UserWithParticipation[];
	placeholder?: React.ReactNode;
}

const LeaderboardList: React.FC<LeaderboardListProps> & {
	Skeleton: typeof LeaderboardListSkeleton;
} = ({ users, ...props }) => {
	const router = useRouter();

	const columns = useMemo(() => {
		return [
			{
				key: "place",
				name: (
					<View className="pl-1.5 basis-10">
						<Typography size="small" type="washed">
							#
						</Typography>
					</View>
				),
				render: ({ place }: { place: number }) => {
					return (
						<View className="bg-red-50 mr-3 px-2 py-1 rounded-full">
							<Typography size="small" className="text-red-400">
								#{place}
							</Typography>
						</View>
					);
				},
			},
			{
				key: "name",
				name: (
					<View className="basis-[72%] xl:basis-1/3">
						<Typography size="small" type="washed">
							Nazwa
						</Typography>
					</View>
				),
				render: ({
					user: { id, name, email, image },
				}: {
					user: {
						id: string;
						name: string;
						email: string;
						image?: string | null;
					};
				}) => {
					return (
						<View className="flex-row gap-4 basis-[62%] sm:basis-[66%] xl:basis-1/3">
							<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12 overflow-hidden">
								{image ? (
									<Image source={{ uri: image }} className="w-full h-full" />
								) : (
									<CircleUser size={20} className="text-gray-600" />
								)}
							</View>
							<View className="justify-center gap-0.5">
								<Link href={`/users/${id}`}>
									<Typography size="base">{name}</Typography>
								</Link>
								<Typography type="washed">{email}</Typography>
							</View>
						</View>
					);
				},
			},
			{
				key: "team",
				name: (
					<View className="hidden xl:flex basis-[45%]">
						<Typography size="small" type="washed">
							Drużyna
						</Typography>
					</View>
				),
				render: ({
					team,
				}: {
					team: Athlete[];
				}) => {
					return (
						<View className="hidden xl:flex flex-row gap-2 basis-[45%]">
							{team.map((athlete) => (
								<Avatar key={athlete.id} name={athlete.firstName} />
							))}
						</View>
					);
				},
			},
			{
				key: "score",
				name: "Wynik",
				render: ({ participant }: { participant: { lastPoints: number } }) => (
					<View className="flex-row items-end">
						<Typography size="base">{participant.lastPoints} </Typography>
						<Typography size="small" className="mb-0.5">
							PKT
						</Typography>
					</View>
				),
			},
			{
				key: "action",
				render: ({ user: { id } }: { user: { id: string } }) => (
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
									onPress: () => router.push(`/users/${id}`),
								},
							]}
						/>
					</View>
				),
			},
		];
	}, [router]);

	return (
		<Table
			columns={columns}
			data={users.map((user, index) => ({
				...user,
				id: user.user.id,
				place: index + 1,
			}))}
			{...props}
		/>
	);
};

const LeaderboardListSkeleton: React.FC<{ rowsCount?: number }> = ({
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
					<Skeleton className="mr-4 w-5 h-6" />
					<View className="flex-row items-center gap-4 basis-[72%] xl:basis-1/3">
						<Skeleton className="!rounded-full w-12 h-12" />
						<View className="gap-2">
							<Skeleton className="w-36 h-5" />
							<Skeleton className="w-24 h-4" />
						</View>
					</View>
					<View className="hidden xl:flex basis-[45%]">
						<Skeleton className="!rounded-full w-8 h-8" />
					</View>
					<Skeleton className="w-16 h-5" />
				</View>
			))}
		</View>
	);
};

LeaderboardList.Skeleton = LeaderboardListSkeleton;

export default LeaderboardList;
