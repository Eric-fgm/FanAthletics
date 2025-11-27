import type {
	Athlete,
	Discipline,
	PersonalRecord,
	SeasonBest,
} from "@fan-athletics/shared/types";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { UserRound, UserRoundPlus } from "lucide-react-native";
import { CircleUser, Crown, Info, Plus } from "lucide-react-native";
import { ArrowRight, Cake, Earth, Star, Trash2 } from "lucide-react-native";
import React, { useState, useRef } from "react";
import {
	Animated,
	Easing,
	Image,
	ImageBackground,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { Button, Dialog, Select, Typography } from "#/components";
import EventHeader from "#/components/event-header";
import {
	AthletesSearchDialog,
	useAthletePersonalRecordsQuery,
	useAthleteQuery,
	useAthleteSeasonBestsQuery,
	useEventQuery,
} from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";
import {
	TeamManageDialog,
	useAddTeamMemberMutation,
	useDeleteTeamLeaderPrivilegeMutation,
	useDeleteTeamMemberMutation,
	useInvalidateParticipation,
	useMakeTeamLeaderMutation,
	useParticipateMutation,
	useParticipationQuery,
	useTeamMembersQuery,
} from "#/features/participation";
import { formatDate } from "#/helpers/date";
import { shadow } from "#/helpers/styles";
import {
	AthleteCostBox,
	GradientBox,
	GradientType,
	RightTriangle,
	StarBadge,
	countries,
	menColors,
	womenColors,
} from "./utils";
import type { AthleteColors } from "./utils";

const Participation = () => {
	const { tab } = useLocalSearchParams<{ tab?: string }>();
	const [selectedMember, setSelectedMember] = useState<Athlete | "edit" | null>(
		null,
	);
	const [memberToDelete, setMemberToDelete] = useState<Athlete | null>(null);
	const [isAthleteDialogVisible, setAthleteDialogVisible] = useState(false);
	const { data: event, isLoading: isEventLoading } = useEventQuery();
	const { invalidate: invalidateParticipation } = useInvalidateParticipation();
	const { mutateAsync: addTeamMember, isPending: isAddTeamMemberPending } =
		useAddTeamMemberMutation();
	const {
		mutateAsync: deleteTeamMember,
		isPending: isDeleteTeamMemberPending,
	} = useDeleteTeamMemberMutation();
	const { mutateAsync: participate, isPending: isParticipatePending } =
		useParticipateMutation();
	const { data: participation } = useParticipationQuery();
	const { data: teamMembers = [] } = useTeamMembersQuery({
		enabled: !!participation,
	});
	const teamMembersSlots =
		teamMembers.length < 8
			? [
					...teamMembers,
					...(Array(8 - teamMembers.length).fill(null) as null[]),
				]
			: teamMembers;
	const hasChoosenCaptain = teamMembers.some((member) => member.isCaptain);

	if (!event) return null;

	if (!participation) {
		return (
			<View className="flex-1 justify-center items-center gap-y-3 text-center">
				<Typography size="large2">Nie masz jeszcze drużyny</Typography>
				<Typography
					size="medium"
					type="washed"
					style={{ fontFamily: "inter-regular" }}
					className="mb-3"
				>
					Weź udział w wydarzeniu i konkuruj z innymi.
				</Typography>
				<Button
					text="Stwórz"
					size="small"
					textStyle={{ fontFamily: "inter-regular", letterSpacing: 0.1 }}
					textClassName="!text-sm px-1"
					rounded
					disabled={event.status !== "available"}
					variant={event.status === "available" ? "primary" : "washed"}
					onPress={async () => {
						await participate(event.id);
						await invalidateParticipation(event.id);
					}}
				/>
				{event.status !== "available" && (
					<Typography type="washed">
						Nie można jeszcze utworzyć drużyny w ramach tego wydarzenia
					</Typography>
				)}
			</View>
		);
	}

	return (
		<ScrollArea>
			<EventHeader event={event} />
			<Header
				title="Drużyna"
				// titleClassName="items-center"
				// filtersClassName="items-center"
				filters={[
					{
						key: "tab",
						items: [
							{ name: "Zarządanie", value: "" },
							{ name: "Historia", value: "history" },
						],
						type: "switch",
					},
				]}
			/>
			{tab === "history" ? null : (
				<>
					{((teamMembers.length < 8 && teamMembers.length > 0) ||
						!hasChoosenCaptain) && (
						<View className="mt-4 -mb-4 px-4 lg:px-12 w-full">
							<View className="flex-row items-center gap-2 bg-gray-100 px-4 rounded-xl w-full h-10">
								<Info size={16} />
								<Typography>
									{teamMembers.length < 8
										? "Nie wybrano wszystkich 8 zawodników"
										: "Nie wybrano lidera drużyny"}
								</Typography>
							</View>
						</View>
					)}
					<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
						<View className="flex-row items-center gap-2">
							<Typography size="large2">Statystyki</Typography>
						</View>
					</View>
					<View className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-12">
						{[
							{ title: "Budżet", value: participation.budget, excerpt: "XP" },
							{
								title: "Wynik",
								value: participation.lastPoints,
								excerpt: "PKT",
							},
							{
								title: "Rozpoczęto",
								value: formatDate(new Date(participation.createdAt)),
							},
							{ title: "Koniec", value: formatDate(new Date(event.endAt)) },
						].map((card) => (
							<View
								key={card.title}
								className="gap-y-2 bg-gray-100 px-8 py-6 rounded-2xl"
							>
								<Typography type="washed">{card.title}</Typography>
								<View className="flex-row items-end gap-1.5">
									<Typography size="large4.5" numberOfLines={1}>
										{card.value}
									</Typography>
									<Typography size="large2" className="mb-1">
										{card.excerpt}
									</Typography>
								</View>
							</View>
						))}
					</View>
					<View className="mt-12 px-4 lg:px-12 pb-6">
						<Typography size="large2">Zespół</Typography>
					</View>
					<View className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-12">
						{teamMembersSlots.sort((a, b) => {
							if (a && b) {
								if (a.sex < b.sex) return -1;
								return 1;
							}
							if (a)
								return -1;
							return 1;
						}).map((member, index) => (
							<React.Fragment key={member?.id ?? index}>
								{member ? (
									member.isCaptain ? (
										<View>
											<View className="w-auto flex-row" style={{ alignSelf: "flex-start", zIndex: 2, marginBottom: -20 }}>
												<GradientBox sex={member.sex} gradientType={GradientType.POINTS} vertical borderRad={10}>
													<View className="flex-row items-center py-3 pl-4 pr-1 gap-x-2" style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
														<Typography size="large2-s" type="bright">
																{/* +{member.pointsGathered} */}
																+{Math.floor(Math.random()*100)+1000}
														</Typography>
														<StarBadge
																width={25}
																height={25}
																colorCircle="#fff"
																colorStar="black"
														/>
													</View>
												</GradientBox>
												<View style={{ marginTop: 4, marginLeft: -2 }}>
													<RightTriangle width={40} height={48} colorTop={menColors.captainDownGradient} colorBottom={menColors.captainUpGradient}/>
												</View>
											</View>
											<View
												className="rounded-2xl"
												style={{
													shadowOpacity: 0.25,
													shadowColor: "black",
													shadowRadius: 10,
													shadowOffset: { width: 4, height: 4 },
													elevation: 8,
													zIndex: 1,
												}}
											>
												<GradientBox
													sex={member.sex}
													vertical
													gradientType={GradientType.CAPTAIN}
													borderRad={16}
												>
													<AthletePreview
														isLoading={
															isAddTeamMemberPending || isDeleteTeamMemberPending
														}
														onEdit={() => setSelectedMember(member)}
														onDelete={() => setMemberToDelete(member)}
														athlete={member}
														isCaptain={member.isCaptain}
														pointsGathered={member.pointsGathered}
													/>
												</GradientBox>
											</View>
										</View>
									) : (
										<AthletePreview
											isLoading={
												isAddTeamMemberPending || isDeleteTeamMemberPending
											}
											onEdit={() => setSelectedMember(member)}
											onDelete={() => setMemberToDelete(member)}
											athlete={member}
											isCaptain={member.isCaptain}
											pointsGathered={member.pointsGathered}
										/>
									)
								) : (
									<AthleteSlot
										index={index + 1}
										onPress={() => setSelectedMember("edit")}
									/>
								)}
							</React.Fragment>
						))}
					</View>
					<AthletesSearchDialog
						disabledAtletes={teamMembers.map((member) => member.id)}
						budget={participation.budget}
						isOpen={selectedMember !== null}
						webOptions={{ variant: "wide" }}
						onClose={() => setSelectedMember(null)}
						onSelect={async (athlete) => {
							try {
								if (selectedMember && typeof selectedMember === "object")
									await deleteTeamMember(selectedMember.id);
								await addTeamMember(athlete.id);
								await invalidateParticipation(athlete.eventId);
								setSelectedMember(null);
							} catch (error) {
								console.error("Failed to add team member:", error);
							}
						}}
					/>
					<Dialog
						isOpen={memberToDelete !== null}
						onClose={() => setMemberToDelete(null)}
					>
						<View className="px-8 py-6">
							<Typography size="large1" className="mb-3">
								Na pewno chcesz usunąć tego zawodnika?
							</Typography>
							<View className="border border-black w-full mb-3" />
							<View className="flex-row items-end w-full">
								<Button
									text="Tak"
									variant="danger"
									size="small"
									className="mt-auto me-3"
									textClassName="!text-sm"
									rounded
									onPress={async () => {
										if (memberToDelete && typeof memberToDelete === "object") {
											await deleteTeamMember(memberToDelete.id);
											await invalidateParticipation(memberToDelete?.eventId);
										}
										setMemberToDelete(null);
									}}
								/>
								<Button
									text="Nie"
									variant="secondary"
									size="small"
									className="mt-auto"
									textClassName="!text-sm"
									rounded
									onPress={() => setMemberToDelete(null)}
								/>
							</View>
						</View>
					</Dialog>
				</>
			)}
		</ScrollArea>
	);
};

const AthleteSlot: React.FC<{ index: number; onPress: () => void }> = ({
	index,
	onPress,
}) => {
	return (
		<View className="p-4 rounded-2xl">
			<View
				className="relative justify-center items-center border border-gray-200 border-dashed rounded-2xl h-[432px]"
				style={{ backgroundColor: "lightgrey" }}
			>
				<Pressable
					className="justify-center items-center rounded-full w-16 h-16"
					onPress={onPress}
				>
					<UserRoundPlus size={72} className="text-gray-500" />
				</Pressable>
				<Typography className="mt-4">Miejsce {index}</Typography>
			</View>
		</View>
	);
};

const AthletePreview: React.FC<{
	athlete: Athlete;
	isCaptain: boolean;
	pointsGathered: number;
	isLoading?: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
}> = ({ athlete, isCaptain, pointsGathered, isLoading, onEdit, onDelete }) => {
	console.log(
		athlete.nationality,
		countries[athlete.nationality],
		`https://flagsapi.com/${countries[athlete.nationality].code}/flat/64.png`,
	);
	const {
		mutateAsync: makeAthleteCaptain,
		isPending: isMakeAthleteCaptainPending,
	} = useMakeTeamLeaderMutation();
	const {
		mutateAsync: deleteCaptainPrivilege,
		isPending: isDeleteCaptainPrivilegePending,
	} = useDeleteTeamLeaderPrivilegeMutation();
	const { invalidate: invalidateParticipation } = useInvalidateParticipation();

	const [detailedMember, setDetailedMember] = useState<Athlete | null>(null);
	const [disciplines, setDisciplines] = useState<Discipline[] | undefined>([]);

	const colors = athlete.sex === "M" ? menColors : womenColors;

	return (
		// <View className="items-center border border-gray-200 rounded-2xl h-[432px]" style={{backgroundColor: "#ffffffff"}}>
		<View>
			<View className="p-5 rounded-2xl">
				{!isCaptain ? (
					<View className="w-auto flex-row" style={{ alignSelf: "flex-start", marginTop: -20, marginBottom: -28, zIndex: 1 }}>
						<GradientBox sex={athlete.sex} gradientType={GradientType.POINTS} vertical borderRad={10}>
							<View className="flex-row items-center pt-3 pb-10 pl-4 pr-1 gap-x-2">
								<Typography size="large2-s" type="bright">
									{/* +{pointsGathered} */}
									+{Math.floor(Math.random()*100)+1000}
								</Typography>
								<StarBadge
									width={25}
									height={25}
									colorCircle="#fff"
									colorStar={colors.captainUpGradient}
								/>
							</View>
						</GradientBox>
						<View style={{ marginTop: 4, marginLeft: -2 }}>
							<RightTriangle width={55} height={66} colorTop={menColors.captainDownGradient} colorBottom={menColors.captainUpGradient}/>
						</View>
					</View>
					) : <></>
				}
				<Pressable
					onPress={() => {
						console.log("Kliknięto: ", athlete);
						setDetailedMember(athlete);
					}}
					style={{ zIndex: 2 }}
				>
					<View
						className="items-center rounded-2xl h-[432px]"
						style={{ backgroundColor: "#ffffffff" }}
					>
						{athlete.imageUrl ? (
							// <View className="items-center rounded-xl">
							// 	{/* <Typography>{athlete.imageUrl}</Typography> */}
							// 	<Image source={{ uri: athlete.imageUrl }} style={{ width: 200, height: 200 }} className="rounded-2xl"/>
							// </View>
							<ImageBackground
								source={{ uri: athlete.imageUrl }}
								imageStyle={{ borderRadius: 16 }}
								// className="rounded-2xl"
								style={{
									width: "100%",
									height: "100%",
									justifyContent: "space-between",
									alignItems: "center",
									borderRadius: 16,
									shadowOpacity: !isCaptain ? 0.25 : undefined,
									shadowColor: !isCaptain ? "black" : undefined,
									shadowRadius: !isCaptain ? 10 : undefined,
									shadowOffset: !isCaptain ? { width: 4, height: 4 } : undefined,
									elevation: !isCaptain ? 8 : 0,
								}}
							>
								<View className="flex-row w-full">
									{/* <View
										className="p-2 rounded-2xl"
										style={{ backgroundColor: "yellow" }}
									>
										<Typography>{athlete.cost} XP</Typography>
									</View> */}
									<View className="ml-auto">
										<AthleteCostBox cost={athlete.cost} />
									</View>
								</View>
								<AthleteBasicInfo athlete={athlete} colors={colors} />
							</ImageBackground>
						) : (
							<View className="justify-center items-center rounded-full w-16 h-16">
								<UserRound size={100} className="text-gray-600" />
								<AthleteBasicInfo athlete={athlete} colors={colors} />
							</View>
						)}
					</View>
					{isCaptain && (
						<View className="items-center mt-3">
							<Typography size="large" type="bright" className="mb-2">
								Kapitan drużyny
							</Typography>
							<Typography size="base" type="bright">
								Zbiera podwójne punkty
							</Typography>
						</View>
					)}
				</Pressable>

				<Dialog
					webOptions={{ variant: "wide" }}
					isOpen={detailedMember !== null}
					onClose={() => setDetailedMember(null)}
				>
					<AthleteInfoDialog
						athlete={detailedMember}
						isCaptain={isCaptain}
						onCaptainPressed={async () => {
							if (detailedMember && typeof detailedMember === "object") {
								await makeAthleteCaptain(detailedMember.id);
								await invalidateParticipation(detailedMember.eventId);
							}
							setDetailedMember(null);
						}}
						onCaptainDeletePressed={async () => {
							if (detailedMember && typeof detailedMember === "object") {
								await deleteCaptainPrivilege(detailedMember.id);
								await invalidateParticipation(detailedMember.eventId);
							}
							setDetailedMember(null);
						}}
						onEdit={onEdit}
						onDelete={onDelete}
						setFunction={setDetailedMember}
						pointsGathered={pointsGathered}
					/>
				</Dialog>
			</View>
		</View>
	);
};

const AthleteInfoDialog: React.FC<{
	athlete: Athlete | null;
	isCaptain: boolean;
	isLoading?: boolean;
	onCaptainPressed?: () => void;
	onCaptainDeletePressed?: () => void;
	setFunction: React.Dispatch<React.SetStateAction<Athlete | null>>;
	onEdit?: () => void;
	onDelete?: () => void;
	pointsGathered: number;
}> = ({
	athlete,
	isCaptain,
	isLoading,
	onCaptainPressed,
	onCaptainDeletePressed,
	setFunction,
	onEdit,
	onDelete,
	pointsGathered,
}) => {
	if (athlete === null) return null;

	const { data: athleteWithDisciplines } = useAthleteQuery(athlete.id);
	const disciplines = athleteWithDisciplines?.disciplines;

	const { data: personalRecords, isLoading: arePersonalRecordsLoading } =
		useAthletePersonalRecordsQuery(athlete.id);
	const { data: seasonBests, isLoading: areSeasonBestsLoading } =
		useAthleteSeasonBestsQuery(athlete.id);

	const [activeRecordsView, setActiveRecordsView] = useState<"PBs" | "SBs">(
		"PBs",
	);

	console.log("RECORDS:", personalRecords);

	const router = useRouter();

	console.log(athlete.lastName, isCaptain, disciplines);
	const colors = athlete.sex === "M" ? menColors : womenColors;

	const fadeAnim = useRef(new Animated.Value(1)).current;
	const handleRecordsSwitch = (records: "PBs" | "SBs") => {
		if (records === activeRecordsView) return;
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 200,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start(() => {
			setActiveRecordsView(records);
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}).start();
		});
	};
	return (
		<View className="py-5 pl-5">
			<View className="flex-row">
				<View className="flex-col items-center flex-[0.35]">
					<View
						className="rounded-2xl shadow-common w-full"
						style={shadow.common}
					>
						<GradientBox
							sex={athlete.sex}
							vertical
							gradientType={GradientType.PROFILE}
							borderRad={16}
						>
							<View className="m-5 items-center gap-y-3">
								{athlete.imageUrl ? (
									<ImageBackground
										source={{ uri: athlete.imageUrl }}
										imageStyle={{ borderRadius: 16, width: "100%" }}
										className="items-center justify-center w-full mt-2 mb-1"
										style={{ width: "95%", height: 350 }}
									>
										{isCaptain ? (
											<View
												className="items-center w-full mt-auto p-2"
												style={{
													backgroundColor: "#d33030",
													borderBottomLeftRadius: 16,
													borderBottomRightRadius: 16,
												}}
											>
												<Typography size="large1" type="bright">
													Kapitan drużyny
												</Typography>
											</View>
										) : (
											<></>
										)}
									</ImageBackground>
								) : (
									<View className="justify-center items-center rounded-full w-16 h-16 m-5">
										<UserRound size={100} className="text-gray-600" />
									</View>
								)}
								<View className="flex-row items-center gap-x-3">
									<Typography
										size={
											athlete.firstName.concat(athlete.lastName).length < 15
												? "large3"
												: "large2"
										}
										style={
											athlete.firstName.concat(athlete.lastName).length >= 17
												? {
														textAlign: "center",
														fontFamily: "inter-semibold",
														marginRight: -6,
														marginVertical: -3,
													}
												: { fontFamily: "inter-semibold", textAlign: "center" }
										}
									>
										{athlete.firstName} {athlete.lastName}
									</Typography>
									<Image
										className="ms-auto h-full"
										source={{
											uri: `https://flagsapi.com/${countries[athlete.nationality].code}/flat/64.png`,
										}}
										style={{ width: 48, height: 32, borderRadius: 24 }}
									/>
								</View>

								<View
									className="h-[1px] w-[95%]"
									style={{ backgroundColor: colors.profileUpGradient }}
								/>
								<View className="flex-row justify-center self-start ml-3 mt-1 gap-x-3">
									<Earth width={30} height={30} />
									<Typography className="mb-2" size="large1">
										{athlete.coach}
									</Typography>
								</View>
								<View className="flex-row justify-center self-start ml-3 gap-x-3">
									<Cake width={30} height={30} />
									<Typography className="mb-2" size="large1">
										{parseDate(athlete.birthdate)}
									</Typography>
								</View>
							</View>
						</GradientBox>
					</View>
					<View className="flex-row items-center justify-between w-full mt-3 gap-x-3">
						{isCaptain ? (
							<Button
								text="Usuń rolę kapitana"
								variant="assignCaptain"
								size="base"
								className="mt-auto flex-[0.7] shadow-common"
								textClassName="!text-lg"
								isLoading={isLoading}
								onPress={onCaptainDeletePressed}
							/>
						) : (
							<Button
								text="Ustaw jako kapitana"
								variant="assignCaptain"
								size="base"
								className="mt-auto flex-[0.7] shadow-common"
								textClassName="!text-lg"
								isLoading={isLoading}
								onPress={onCaptainPressed}
							/>
						)}
						<Button
							text="Usuń"
							//icon={Trash2}
							variant="danger"
							size="base"
							className="mt-auto flex-[0.3] shadow-common"
							textClassName="!text-lg"
							isLoading={isLoading}
							onPress={onDelete}
						/>
					</View>
				</View>
				<View className="m-3 gap-y-3 flex-[0.6]">
					<View className="flex-row items-center mx-3 gap-x-3">
						<View
							className="flex-row items-center justify-center py-2 px-3 mr-2 gap-x-2"
							style={{
								backgroundColor: "#f9f9f9ff",
								borderRadius: 10,
								borderColor: "#c0aa00",
								borderWidth: 3,
							}}
						>
							<Typography size="large1" type="gold">
								{athlete.cost}
							</Typography>
							<Star width={24} height={24} color="#c0aa00" />
						</View>
						<StarBadge
							width={34}
							height={34}
							colorCircle="#d33030"
							colorStar="#fff"
						/>
						<Typography size="large3" type="pointsRed">
							Punkty: +{pointsGathered}
						</Typography>
					</View>
					<View
						className="flex-col rounded-2xl mx-3 p-6 gap-y-2 shadow-common"
						style={[{ backgroundColor: colors.basicInfoColor }, shadow.common]}
					>
						<Typography size="large2-s" className="mx-2 mb-1">
							Następne starty
						</Typography>
						{disciplines !== undefined && disciplines.length > 0 ? (
							disciplines.map((discipline) => (
								<NextStartBoxItem
									key={discipline.name}
									athlete={athlete}
									discipline={discipline}
									onPress={() => {
										setFunction(null);
										router.push(
											`events/${discipline.eventId}/disciplines/${discipline.id}`,
										);
									}}
									prediction="92%"
								/>
							))
						) : (
							<Typography size="large2">Zawodnik już nie ma startów</Typography>
						)}
					</View>
					<View
						className="flex-col rounded-2xl mx-3 p-6 gap-y-2 shadow-common"
						style={[{ backgroundColor: colors.basicInfoColor }, shadow.common]}
					>
						<Typography size="large2-s" className="mx-2 mb-1">
							Poprzednie starty
						</Typography>
						{disciplines !== undefined && disciplines.length > 0 ? (
							disciplines.map((discipline) => (
								<NextStartBoxItem
									key={discipline.name}
									athlete={athlete}
									discipline={discipline}
									onPress={() => {
										setFunction(null);
										router.push(
											`events/${discipline.eventId}/disciplines/${discipline.id}`,
										);
									}}
									prediction="92%"
								/>
							))
						) : (
							<Typography size="large2">Zawodnik już nie ma startów</Typography>
						)}
					</View>
					<View className="flex-col mx-4 mt-1 gap-y-2">
						{/* <Typography size="large2-s">Rekordy życiowe</Typography> */}
						<View className="flex-row gap-x-4 mr-3 mb-1">
							<Button
								text="Rekordy życiowe"
								variant={
									activeRecordsView !== "PBs"
										? "white"
										: athlete.sex === "M"
											? "M"
											: "F"
								}
								textClassName="!text-xl"
								className="w-[50%]"
								onPress={() => handleRecordsSwitch("PBs")}
							/>
							<Button
								text="Rekordy sezonu"
								variant={
									activeRecordsView !== "SBs"
										? "white"
										: athlete.sex === "M"
											? "M"
											: "F"
								}
								textClassName="!text-xl"
								className="w-[50%]"
								onPress={() => handleRecordsSwitch("SBs")}
							/>
						</View>
						<View
							className="h-[1px] w-[93%]"
							style={{ backgroundColor: colors.profileUpGradient }}
						/>
						<Animated.View className="h-full"
							style={{
								height: 100,
								opacity: fadeAnim,
							}} /*className="h-[100px]"*/
						>
							{activeRecordsView === "PBs" ? (
								personalRecords !== undefined && personalRecords.length > 0 ? (
									// personalRecords.slice(0, 4).map((personalRecord, index) =>
									// 	<PersonalRecordsBoxItem key={personalRecord.id} personalRecord={personalRecord} showLine={index !== 3} />) :
									// <></>
									<PersonalRecordsBox personalRecords={personalRecords} />
								) : (
									<></>
								)
							) : seasonBests !== undefined && seasonBests.length > 0 ? (
								<PersonalRecordsBox personalRecords={seasonBests} />
							) : (
								<Typography>Nie ma SBs</Typography>
							)}
						</Animated.View>
					</View>
				</View>
			</View>
		</View>
	);
};

const AthleteBasicInfo: React.FC<{
	athlete: Athlete;
	colors: AthleteColors;
}> = ({ athlete, colors }) => {
	return (
		<View className="flex-column w-full">
			<Image
				source={{
					uri: `https://flagsapi.com/${countries[athlete.nationality].code}/flat/64.png`,
				}}
				style={{ width: 48, height: 32, borderRadius: 24 }}
				className="w-full h-full ms-3 mb-2"
			/>
			<View
				className="items-center px-3 py-5 rounded-xl w-full"
				style={{ backgroundColor: colors.basicInfoColor }}
			>
				<Typography size="large1" className="mt-1" numberOfLines={1}>
					{athlete.firstName} {athlete.lastName}
				</Typography>
				<Typography
					size="large"
					type="washed"
					className="mt-1"
					numberOfLines={1}
				>
					{athlete.coach}
				</Typography>
			</View>
		</View>
	);
};

export const NextStartBoxItem: React.FC<{
	athlete: Athlete;
	discipline: Discipline;
	prediction?: string;
	onPress?: () => void;
}> = ({ athlete, discipline, prediction, onPress }) => {
	return (
		<Pressable onPress={onPress}>
			<View
				className="flex-row items-center px-4 gap-x-10"
				style={{
					backgroundColor: "#f7f7f7",
					borderColor: "#b8b8b8",
					borderWidth: 2,
					borderRadius: 10,
				}}
			>
				<Typography size="large-s" className="">
					{discipline.name}
				</Typography>
				<Typography size="large" className="">
					12:45
				</Typography>
				<View className="m-2">
					<GradientBox
						sex={athlete.sex}
						horizontal
						gradientType={GradientType.HONOURS}
						borderRad={8}
					>
						<Typography size="large-s" type="bright" className="mx-2 my-1">
							{prediction}
						</Typography>
					</GradientBox>
				</View>
				<ArrowRight className="ml-auto" />
			</View>
		</Pressable>
	);
};

export const PreviousStartBoxItem: React.FC<{
	athlete: Athlete;
	discipline: Discipline;
	prediction?: string;
	onPress?: () => void;
}> = ({ athlete, discipline, prediction, onPress }) => {
	return (
		<Pressable onPress={onPress}>
			<View
				className="flex-row items-center px-4 gap-x-10"
				style={{
					backgroundColor: "#f7f7f7",
					borderColor: "#b8b8b8",
					borderWidth: 2,
					borderRadius: 10,
				}}
			>
				<Typography size="large1" className="">
					{discipline.name}
				</Typography>
				<Typography size="large" className="">
					12:45
				</Typography>
				<View className="m-2">
					<GradientBox
						sex={athlete.sex}
						horizontal
						gradientType={GradientType.HONOURS}
						borderRad={8}
					>
						<Typography size="large1" type="bright" className="mx-2 my-1">
							{prediction}
						</Typography>
					</GradientBox>
				</View>
				<ArrowRight className="ml-auto" />
			</View>
		</Pressable>
	);
};

export const PersonalRecordsBoxItem: React.FC<{
	personalRecord: PersonalRecord | SeasonBest;
	showLine?: boolean;
}> = ({ personalRecord, showLine = true }) => {
	return (
		<View className="flex-column gap-y-1 mb-2">
			<View className="flex-row items-center gap-x-5">
				<Typography size="base-s" className="w-[20%]">
					{personalRecord.disciplineName}
				</Typography>
				<Typography size="base" className="w-[28%]">
					{personalRecord.result.replace(/[\n\r]/g, " ")}
				</Typography>
				<Typography size="medium" className="w-[22%]">
					{personalRecord.date}
				</Typography>
				<Typography size="base" className="w-[20%]">
					{personalRecord.location}
				</Typography>
				{personalRecord.resultPoints && personalRecord.resultPoints > 0 ? (
					<Typography size="base" className="w-[10%] text-end mr-8">
						{personalRecord.resultPoints}
					</Typography>
					) : (
						<Typography className="w-[10%] text-end mr-8"></Typography>
					)}
			</View>
			{showLine && (
				<View
					className="h-[1px] w-[95%]"
					style={{ backgroundColor: "#b8b8b8" }}
				/>
			)}
		</View>
	);
};

export const PersonalRecordsBox: React.FC<{
	personalRecords: PersonalRecord[] | SeasonBest[];
}> = ({ personalRecords }) => {
	return (
		<View className="flex-1">
			<ScrollView className="flex-1">
				{personalRecords
					.sort((a, b) => {
						if (
							a.resultPoints &&
							b.resultPoints
						)
							return b.resultPoints - a.resultPoints;
						if (a.resultPoints)
							return -1;
						return 1;
					})
					.map((record) => (
						<PersonalRecordsBoxItem key={record.id} personalRecord={record} />
					))}
			</ScrollView>
		</View>
	);
};

function parseDate(date: string) {
	if (date === undefined || date === null) return "";
	const day = Number.parseInt(date.substring(8, 10));
	const year = date.substring(0, 4);
	let month = date.substring(5, 7);

	switch (month) {
		case "01":
			month = " stycznia ";
			break;
		case "02":
			month = " lutego ";
			break;
		case "03":
			month = " marca ";
			break;
		case "04":
			month = " kwietnia ";
			break;
		case "05":
			month = " maja ";
			break;
		case "06":
			month = " czerwca ";
			break;
		case "07":
			month = " lipca ";
			break;
		case "08":
			month = " sierpnia ";
			break;
		case "09":
			month = " września ";
			break;
		case "10":
			month = " października ";
			break;
		case "11":
			month = " listopada ";
			break;
		case "12":
			month = " grudnia ";
			break;
	}
	return day + month + year;
}

export default Participation;
