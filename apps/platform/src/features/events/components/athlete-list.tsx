import type {
	Athlete,
	AthleteWithDisciplines,
} from "@fan-athletics/shared/types";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { CircleUser, Ellipsis } from "lucide-react-native";
import React, { useState } from "react";
import { useMemo } from "react";
import { Image, View } from "react-native";
import { Dropdown, Skeleton, Table, Typography } from "#/components";
import { AthleteUpdateDialog } from "#/features/admin";
import { useSessionSuspeneQuery } from "#/features/auth";
import { isAdmin } from "#/helpers/user";
import { getDisciplineIcon } from "../helpers";

interface AthleteListProps {
	athletes: AthleteWithDisciplines[];
	placeholder?: React.ReactNode;
}

const AthleteList: React.FC<AthleteListProps> & {
	Skeleton: typeof AthleteListSkeleton;
} = ({ athletes, ...props }) => {
	const { eventId } = useLocalSearchParams();
	const router = useRouter();
	const { data: session } = useSessionSuspeneQuery();

	const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

	const columns = useMemo(() => {
		return [
			{
				key: "imageUrl",
				render: ({
					id,
					imageUrl,
					firstName,
					lastName,
					coach,
				}: {
					id: string;
					imageUrl: string | null;
					firstName: string;
					lastName: string;
					coach: string;
				}) => (
					<View className="flex-row gap-4 pr-4 basis-[72%] xl:basis-1/3">
						<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12">
							{imageUrl ? (
								<Image source={{ uri: imageUrl }} className="w-full h-full rounded-full" />
							) : (
								<CircleUser size={20} className="text-gray-600" />
							)}
						</View>
						<View className="flex-1 justify-center items-start gap-0.5">
							<Typography numberOfLines={1} size="base" className="relative">
								{firstName} {lastName}
							</Typography>
							<Typography numberOfLines={1} type="washed">
								{coach}
							</Typography>
							<Link
								href={`/events/${eventId}/athletes/${id}`}
								className="top-0 left-0 absolute w-full h-full"
							/>
						</View>
					</View>
				),
			},
			{
				key: "disciplines",
				render: ({
					disciplines,
				}: { disciplines: { id: string; icon: string; name: string }[] }) => (
					<View className="hidden xl:flex flex-row items-center gap-2 basis-[45%]">
						{(() => {
							if (disciplines.length === 0) {
								return <Typography>-</Typography>;
							}

							const discipline = disciplines[0];
							const Icon = getDisciplineIcon(discipline.icon);
							return (
								<React.Fragment key={discipline.id}>
									<View className="justify-center items-center bg-gray-100 rounded-full w-8 h-8">
										<Icon size={16} className="text-gray-500" />
									</View>
									<Link
										href={`/events/${eventId}/disciplines/${discipline.id}`}
									>
										<Typography size="base">{discipline.name}</Typography>
									</Link>
								</React.Fragment>
							);
						})()}
					</View>
				),
			},
			{
				key: "cost",
				render: ({ cost }: { cost: number }) => (
					<View className="flex-row items-end">
						<Typography size="base">{cost} </Typography>
						<Typography size="small" className="mb-0.5">
							XP
						</Typography>
					</View>
				),
			},
			{
				key: "action",
				render: (athlete: Athlete) => (
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
										router.push(`/events/${eventId}/athletes/${athlete.id}`),
								},
								...(session && isAdmin(session.user)
									? [
											{
												name: "Edytuj zawodnika",
												onPress: () => setSelectedAthlete(athlete),
											},
										]
									: []),
							]}
						/>
					</View>
				),
			},
		];
	}, [eventId, router, session]);

	return (
		<>
			<Table columns={columns} data={athletes} {...props} />
			{selectedAthlete !== null && (
				<AthleteUpdateDialog
					isOpen
					onClose={() => setSelectedAthlete(null)}
					values={selectedAthlete}
				/>
			)}
		</>
	);
};

const AthleteListSkeleton: React.FC<{ rowsCount?: number }> = ({
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
					<View className="hidden xl:flex flex-row items-center gap-2 basis-[45%]">
						<Skeleton className="!rounded-full w-8 h-8" />
						<Skeleton className="w-24 h-5" />
					</View>
					<Skeleton className="w-16 h-5" />
				</View>
			))}
		</View>
	);
};

AthleteList.Skeleton = AthleteListSkeleton;

export default AthleteList;
