import type { Athlete } from "@fan-athletics/shared/types";
import { UserRound, UserRoundPlus } from "lucide-react-native";
import React, { useState } from "react";
import { Image, ImageBackground, Pressable, View } from "react-native";
import { Button, Dialog, Select, Typography } from "#/components";
import { AthletesSearchDialog, useEventQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";
import {
	TeamManageDialog,
	useAddTeamMemberMutation,
	useDeleteTeamLeaderPrivilegeMutation,
	useDeleteTeamMemberMutation,
	useInvalidateParticipation,
	useMakeTeamLeaderMutation,
	useParticipationQuery,
	useTeamMembersQuery,
} from "#/features/participation";
import {
	AthleteCostBox,
	GradientBox,
	flags,
	menColors,
	womenColors,
} from "./utils";
import type { AthleteColors } from "./utils";

const Participation = () => {
	const [selectedMember, setSelectedMember] = useState<Athlete | "edit" | null>(
		null,
	);
	const [memberToDelete, setMemberToDelete] = useState<Athlete | null>(null);
	const { data: event } = useEventQuery();
	const { invalidate: invalidateParticipation } = useInvalidateParticipation();
	const { mutateAsync: addTeamMember, isPending: isAddTeamMemberPending } =
		useAddTeamMemberMutation();
	const {
		mutateAsync: deleteTeamMember,
		isPending: isDeleteTeamMemberPending,
	} = useDeleteTeamMemberMutation();
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
				<TeamManageDialog
					trigger={
						<Button
							text="Stwórz"
							size="small"
							textStyle={{ fontFamily: "inter-regular", letterSpacing: 0.1 }}
							textClassName="!text-sm px-1"
							rounded
						/>
					}
				/>
			</View>
		);
	}

	return (
		<ScrollArea>
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
			<View className="flex-row justify-between items-center mt-12 px-4 lg:px-12 pb-6">
				<View className="flex-row items-center gap-2">
					<Typography size="large2">Statystyki</Typography>
				</View>
				<Select />
			</View>
			<View className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-12">
				<View className="gap-y-2 bg-gray-100 px-8 py-6 rounded-2xl">
					<Typography type="washed">Budżet</Typography>
					<View className="flex-row items-end gap-1.5">
						<Typography size="large4.5">{participation.budget}</Typography>
						<Typography size="large2" className="mb-1">
							XP
						</Typography>
					</View>
				</View>
				<View className="gap-y-2 bg-gray-100 px-8 py-6 rounded-2xl">
					<Typography type="washed">Punkty</Typography>
					<View className="flex-row items-end gap-1.5">
						<Typography size="large4.5">{participation.lastPoints}</Typography>
						<Typography size="large2" className="mb-1">
							PKT
						</Typography>
					</View>
				</View>
				<View className="bg-gray-100 rounded-2xl h-32" />
				<View className="bg-gray-100 rounded-2xl h-32" />
			</View>
			<View className="mt-12 px-4 lg:px-12 pb-6">
				<Typography size="large2">Zespół</Typography>
			</View>
			<View className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 lg:px-12">
				{teamMembersSlots.map((member, index) => (
					<React.Fragment key={member?.id ?? index}>
						{member ? (
							member.isCaptain ? (
								<View
									className="rounded-2xl"
									style={{
										shadowOpacity: 0.25,
										shadowColor: "black",
										shadowRadius: 10,
										shadowOffset: { width: 4, height: 4 },
										elevation: 8,
									}}
								>
									<GradientBox
										sex={member.sex}
										vertical
										leftUpColor={
											member.sex === "M"
												? menColors.captainAndHonoursUpGradient
												: womenColors.captainAndHonoursUpGradient
										}
										rightDownColor={
											member.sex === "M"
												? menColors.captainAndHonoursDownGradient
												: womenColors.captainAndHonoursDownGradient
										}
									>
										<AthletePreview
											isLoading={
												isAddTeamMemberPending || isDeleteTeamMemberPending
											}
											onEdit={() => setSelectedMember(member)}
											onDelete={() => setMemberToDelete(member)}
											athlete={member}
											isCaptain={member.isCaptain}
										/>
									</GradientBox>
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
				webOptions={{ variant: "wide"}}
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
	isLoading?: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
}> = ({ athlete, isCaptain, isLoading, onEdit, onDelete }) => {
	console.log(
		athlete.nationality,
		flags[athlete.nationality],
		`https://flagsapi.com/${flags[athlete.nationality].code}/flat/64.png`,
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

	const colors = athlete.sex === "M" ? menColors : womenColors;

	return (
		// <View className="items-center border border-gray-200 rounded-2xl h-[432px]" style={{backgroundColor: "#ffffffff"}}>
		<View className="p-5 rounded-2xl">
			<Pressable
				onPress={() => {
					console.log("Kliknięto: ", athlete);
					setDetailedMember(athlete);
				}}
			>
				<View
					className="items-center border border-gray-200 rounded-2xl h-[432px]"
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
							<View className="w-full items-end">
								{/* <View
									className="p-2 rounded-2xl"
									style={{ backgroundColor: "yellow" }}
								>
									<Typography>{athlete.cost} XP</Typography>
								</View> */}
								<AthleteCostBox cost={athlete.cost} />
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
						<Typography size="base">Zbiera podwójne punkty</Typography>
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
				/>
			</Dialog>
		</View>
	);
};

const AthleteInfoDialog: React.FC<{
	athlete: Athlete | null;
	isCaptain: boolean;
	isLoading?: boolean;
	onCaptainPressed?: () => void;
	onCaptainDeletePressed?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}> = ({
	athlete,
	isCaptain,
	isLoading,
	onCaptainPressed,
	onCaptainDeletePressed,
	onEdit,
	onDelete,
}) => {
	if (athlete === null) return null;

	console.log(athlete.lastName, isCaptain);
	return (
		<View className="p-3">
			<View className="flex-row">
				<View className="m-3 items-center">
					{athlete.imageUrl ? (
						<Image
							source={{ uri: athlete.imageUrl }}
							className="m-2 rounded-xl"
							style={{ width: 300, height: 400 }}
						/>
					) : (
						<View className="justify-center items-center rounded-full w-16 h-16 m-5">
							<UserRound size={100} className="text-gray-600" />
						</View>
					)}
					<Typography className="mb-2" size="large1">
						{athlete.firstName} {athlete.lastName}
					</Typography>
					<Typography className="mb-2" size="large">
						Klub: {athlete.coach}
					</Typography>
					<Typography className="mb-2" size="large">
						Numer: {athlete.number}
					</Typography>
					{isCaptain && <Typography>Jestem kapitanem</Typography>}
				</View>
				<View className="flex-row items-center">
					{isCaptain ? (
						<Button
							text="Usuń przywilej kapitana"
							variant="danger"
							size="base"
							className="mt-auto"
							textClassName="!text-sm"
							isLoading={isLoading}
							rounded
							onPress={onCaptainDeletePressed}
						/>
					) : (
						<Button
							text="Ustaw jako kapitana"
							variant="primary"
							size="base"
							className="mt-auto"
							textClassName="!text-sm"
							isLoading={isLoading}
							rounded
							onPress={onCaptainPressed}
						/>
					)}
					<Button
						text="Usuń zawodnika"
						variant="danger"
						size="base"
						className="mt-auto"
						textClassName="!text-sm"
						isLoading={isLoading}
						rounded
						onPress={onDelete}
					/>
					<Button
						text="Edytuj zawodnika"
						variant="primary"
						size="base"
						className="mt-auto"
						textClassName="!text-sm"
						isLoading={isLoading}
						rounded
						onPress={onEdit}
					/>
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
					uri: `https://flagsapi.com/${flags[athlete.nationality].code}/flat/64.png`,
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

export default Participation;
