import type { Athlete } from "@fan-athletics/shared/types";
import { useLocalSearchParams } from "expo-router";
import { CircleUser, Crown, Info, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Button, Select, Typography } from "#/components";
import { AthletesSearchDialog, useEventQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";
import {
	TeamManageDialog,
	useAddTeamMemberMutation,
	useDeleteTeamMemberMutation,
	useInvalidateParticipation,
	useMakeTeamLeaderMutation,
	useParticipationQuery,
	useTeamMembersQuery,
} from "#/features/participation";
import { formatDate } from "#/helpers/date";

const Participation = () => {
	const { tab } = useLocalSearchParams<{ tab?: string }>();
	const [selectedMember, setSelectedMember] = useState<Athlete | "edit" | null>(
		null,
	);
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
						{teamMembersSlots.map((member, index) => (
							<React.Fragment key={member?.id ?? index}>
								{member ? (
									<AthletePreview
										isLoading={
											isAddTeamMemberPending || isDeleteTeamMemberPending
										}
										onEdit={() => setSelectedMember(member)}
										{...member}
									/>
								) : (
									<AthleteSlot
										index={index + 1}
										onPress={() => setSelectedMember("edit")}
									/>
								)}
							</React.Fragment>
						))}
					</View>
				</>
			)}
			<AthletesSearchDialog
				disabledAtletes={teamMembers.map((member) => member.id)}
				isOpen={selectedMember !== null}
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
		</ScrollArea>
	);
};

const AthleteSlot: React.FC<{ index: number; onPress: () => void }> = ({
	index,
	onPress,
}) => {
	return (
		<View className="relative justify-center items-center border border-gray-200 border-dashed rounded-2xl h-[324px]">
			<Pressable
				className="justify-center items-center bg-gray-100 rounded-full w-16 h-16"
				onPress={onPress}
			>
				<Plus size={24} className="text-gray-500" />
			</Pressable>
			<Typography className="mt-4">Miejsce {index}</Typography>
		</View>
	);
};

const AthletePreview: React.FC<{
	id: string;
	firstName: string;
	lastName: string;
	coach: string;
	isCaptain: boolean;
	isLoading?: boolean;
	onEdit?: () => void;
}> = ({ id, firstName, lastName, coach, isCaptain, isLoading, onEdit }) => {
	const { mutate: makeCaptain, isPending } = useMakeTeamLeaderMutation();

	return (
		<View
			className={`items-center px-8 pt-12 pb-8 border-gray-200 rounded-2xl h-[324px] ${isCaptain ? "border-4" : "border"}`}
		>
			<View className="justify-center items-center bg-gray-100 rounded-full w-16 h-16">
				<CircleUser size={24} className="text-gray-600" />
			</View>
			<Typography size="large" className="mt-4" numberOfLines={1}>
				{firstName} {lastName}
			</Typography>
			<Typography type="washed" className="mt-1" numberOfLines={1}>
				{coach}
			</Typography>
			<View className="flex-row gap-2 mt-auto">
				<Button
					text="Edytuj"
					variant="secondary"
					size="small"
					textClassName="!text-sm"
					isLoading={isLoading}
					rounded
					onPress={onEdit}
				/>
				{!isCaptain && (
					<Button
						size="small"
						icon={Crown}
						rounded
						isLoading={isPending}
						onPress={() => makeCaptain(id)}
					/>
				)}
			</View>
		</View>
	);
};

export default Participation;
