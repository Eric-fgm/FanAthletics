import type { UserTeam } from "@fan-athletics/shared/types";
import {
	Link,
	useFocusEffect,
	useLocalSearchParams,
	useRouter,
} from "expo-router";
import { Trophy } from "lucide-react-native";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { Avatar, Button, Typography } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import ScrollArea from "#/features/layout/components/scroll-area";
import {
	UserEditDialog,
	useUserQuery,
	useUserTeamsQuery,
} from "#/features/users";

export default function UserProfile() {
	const { id } = useLocalSearchParams();
	const { data: user } = useUserQuery(id.toString());
	const { data: session } = useSessionSuspeneQuery();

	const { data: userTeams, refetch } = useUserTeamsQuery(id.toString());

	useFocusEffect(
		React.useCallback(() => {
			refetch();
		}, [refetch]),
	);

	if (!user) {
		return null;
	}

	const { name, email, image } = {
		...user,
		...(user.id === session?.user.id && session.user),
	};

	const isMyProfile = user.id === session?.user.id;

	return (
		<ScrollArea className="pt-12 lg:pt-16 pb-8 items-center">
			<Avatar name={name} image={image} size="large" />
			<Typography size="large4" className="mt-6">
				{name}
			</Typography>
			<Typography type="washed" className="mt-2">
				{email}
			</Typography>
			{id === session?.user.id && (
				<UserEditDialog
					trigger={
						<Button
							text="Edytuj profil"
							variant="outlined"
							rounded
							className="mt-6 h-11"
						/>
					}
					user={session.user}
				/>
			)}
			<View className="w-full p-7 mt-3">
				{userTeams ? (
					<View>
						<Typography size="large3" className="ms-3">
							{isMyProfile
								? "Moje drużyny"
								: `Drużyny użytkownika ${user.name}`}
						</Typography>
						<TeamList teams={userTeams ?? []} isMyProfile={isMyProfile} />
					</View>
				) : (
					<View className="w-full items-center justify-center">
						<Typography size="large3" type="washed">
							{isMyProfile
								? "Nie stworzyłeś jeszcze żadnej drużyny."
								: `Użytkownik ${user.name} nie stworzył jeszcze żadnej drużyny`}
						</Typography>
					</View>
				)}
			</View>
		</ScrollArea>
	);
}

const TeamList: React.FC<{
	teams: UserTeam[];
	isMyProfile: boolean;
}> = ({ teams, isMyProfile }) => {
	const router = useRouter();

	teams.sort((a, b) => {
		if (a.eventName.toLowerCase() < b.eventName.toLowerCase()) return -1;
		return 1;
	});

	return (
		<View className="flex-column p-5">
			{teams.map((team, index) => (
				<View
					key={team.id}
					className="sm:flex-row flex-col flex-1 p-4 gap-4 sm:items-center sm:h-[100] h-[150] border border-gray-200"
					style={{
						backgroundColor: index % 2 === 0 ? "#c9c9c9ff" : "#ffffff",
						borderTopLeftRadius: index === 0 ? 16 : 0,
						borderTopRightRadius: index === 0 ? 16 : 0,
						borderBottomLeftRadius: index === teams.length - 1 ? 16 : 0,
						borderBottomRightRadius: index === teams.length - 1 ? 16 : 0,
					}}
				>
					<View className="bg-red-50 mr-3 px-2 py-1 rounded-full hidden sm:flex">
						<Typography size="small" className="text-red-600">
							#{index + 1}
						</Typography>
					</View>
					<View className="flex-row items-center gap-3 basis-[50%] xl:basis-1/3">
						<View className="w-16 h-16 rounded-full items-center justify-center">
							{team.eventIcon ? (
								<View className="w-full h-full bg-white items-center justify-center rounded-xl">
									<Image
										source={{ uri: team.eventIcon }}
										style={{ width: "75%", height: "75%" }}
									/>
								</View>
							) : (
								<Trophy size="75%" className="text-gray-600" />
							)}
						</View>
						<Link href={`/events/${team.eventId}`}>
							<Typography size="base">{team.eventName}</Typography>
						</Link>
					</View>
					<View className="flex-row">
						<View className="bg-red-50 mr-3 px-2 py-1 rounded-full justify-center max-sm:flex hidden lg:flex">
							<Typography size="base" className="text-red-600">
								{team.points} PKT
							</Typography>
						</View>
						<View className="bg-red-50 mr-3 px-2 py-1 rounded-full justify-center max-sm:flex hidden lg:flex">
							<Typography size="base" className="text-red-600">
								{team.budget} XP
							</Typography>
						</View>
						<View className="hidden max-sm:flex ms-auto">
							{isMyProfile && (
								<Button
									text="Zobacz drużynę"
									rounded
									onPress={() =>
										router.push(`/events/${team.eventId}/participation`)
									}
								/>
							)}
						</View>
					</View>
					<View className="flex-row flex-wrap gap-2 basis-[40%] sm:basis-[70%] xl:basis-1/3 hidden lg:flex overflow-hidden">
						{team.athletes.map((member) => (
							<Pressable
								key={member.id}
								onPress={() =>
									router.push(`/events/${team.eventId}/athletes/${member.id}`)
								}
								className="w-16 h-16 relative group"
							>
								<Image
									source={{ uri: member.imageUrl ?? undefined }}
									className="w-full h-full rounded-full"
								/>
								<View className="absolute top-0 left-0 w-full h-full bg-black rounded-full opacity-0 group-hover:opacity-30" />
							</Pressable>
						))}
					</View>
					<View className="ml-auto justify-center items-center hidden sm:flex">
						{isMyProfile && (
							<Button
								text="Zobacz drużynę"
								rounded
								onPress={() =>
									router.push(`/events/${team.eventId}/participation`)
								}
								className="shrink"
							/>
						)}
					</View>
				</View>
			))}
		</View>
	);
};
