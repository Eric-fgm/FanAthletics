import type { AthleteWithDisciplines } from "@fan-athletics/shared/types";
import { useGlobalSearchParams } from "expo-router";
import { CircleUser, Info, Plus, UserRoundPlus, UserRound } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Button, Dialog, Typography } from "#/components";
import { AthletesSearchDialog } from "#/features/events";
import {
	useAddTeamMemberMutation,
	useInvalidateParticipation,
	useParticipateMutation,
} from "../services";

interface TeamManageDialogProps {
	trigger: React.ReactNode;
}

const TeamManageDialog: React.FC<TeamManageDialogProps> = ({ trigger }) => {
	const eventId = useGlobalSearchParams().eventId?.toString();

	const { invalidate: invalidateParticipation } = useInvalidateParticipation();
	const { mutateAsync: participate, isPending: isParticipatePending } =
		useParticipateMutation();
	const { mutateAsync: addTeamMember, isPending: isAddTeamMemberPending } =
		useAddTeamMemberMutation();

	const [selectedPlayerSlor, setSelectedPlayerSlot] = useState<number | null>(
		null,
	);
	const [selectedAthletes, setSelectedAthletes] = useState<
		(AthleteWithDisciplines | null)[]
	>(Array(8).fill(null));

	return (
		<Dialog trigger={trigger} webOptions={{ variant: "wide" }}>
			{({ close }) => (
				<>
					<View>
						<View className="items-center grid grid-cols-3 px-6 py-4">
							<View>
								<Typography size="small">Bilans</Typography>
								<View className="flex-row items-end gap-0.5">
									<Typography>300</Typography>
									<Typography size="small" className="mb-px">
										XP
									</Typography>
								</View>
							</View>
							<View>
								<Typography size="large" className="text-center">
									Stwórz druzyne
								</Typography>
								<Typography
									className="text-center"
									style={{ fontFamily: "inter-regular" }}
									type="washed"
								>
									Wybierz 8 zawodników
								</Typography>
							</View>
						</View>
						<View className="gap-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-6 py-4">
							{selectedAthletes.map((athlete, index) =>
								athlete ? (
									<PlayerPreview
										key={athlete.id}
										onEdit={() => setSelectedPlayerSlot(index)}
										{...athlete}
									/>
								) : (
									<PlayerSlot
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										key={index}
										index={index + 1}
										onPress={() => setSelectedPlayerSlot(index)}
									/>
								),
							)}
						</View>
						<View className="gap-4 grid grid-cols-2 px-5 py-6">
							<Button
								text="Anuluj"
								variant="outlined"
								rounded
								onPress={close}
							/>
							<Button
								text="Stwórz"
								rounded
								isLoading={isParticipatePending || isAddTeamMemberPending}
								onPress={async () => {
									const athletes = selectedAthletes.filter(
										(athlete) => !!athlete,
									);
									if (!eventId || athletes.length === 0) return;

									try {
										await participate(eventId);
										await Promise.all(
											athletes.map((athlete) => addTeamMember(athlete.id)),
										);
										await invalidateParticipation(eventId);
									} catch (error) {
										console.error("Failed to create team:", error);
									}

									close();
								}}
							/>
						</View>
					</View>
					<AthletesSearchDialog
						disabledAtletes={selectedAthletes
							.filter((athlete) => !!athlete)
							.map((athlete) => athlete.id)}
						isOpen={selectedPlayerSlor !== null}
						onClose={() => setSelectedPlayerSlot(null)}
						onSelect={(athlete) => {
							if (selectedPlayerSlor === null) return;
							const newSelectedAthletes = [...selectedAthletes];
							newSelectedAthletes[selectedPlayerSlor] = athlete;
							setSelectedAthletes(newSelectedAthletes);
							setSelectedPlayerSlot(null);
						}}
					/>
				</>
			)}
		</Dialog>
	);
};

const PlayerSlot: React.FC<{ index: number; onPress: () => void }> = ({
	index,
	onPress,
}) => {
	return (
		<View className="relative justify-center items-center border border-gray-200 border-dashed rounded-2xl h-[224px]">
			<Pressable
				className="justify-center items-center bg-gray-100 rounded-full w-12 h-12"
				onPress={onPress}
			>
				<UserRoundPlus size={20} className="text-gray-500" />
			</Pressable>
			<Typography className="mt-4">Miejsce {index}</Typography>
		</View>
	);
};

const PlayerPreview: React.FC<
	AthleteWithDisciplines & { onEdit: () => void }
> = ({ firstName, lastName, coach, onEdit }) => {
	return (
		<View
			className="relative items-center p-6 border border-gray-200 rounded-2xl h-[224px]"
			style={{
				backgroundColor: "white",
				shadowColor: "#000",
				shadowOpacity: 0.08,
				shadowOffset: { width: 0, height: 4 },
				shadowRadius: 16,
			}}
		>
			<View className="top-3 right-3 absolute text-gray-500">
				<Info size={16} />
			</View>
			<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12">
				<UserRound size={20} className="text-gray-600" />
			</View>
			<Typography
				size="base"
				className="mt-3 mb-0.5 text-center"
				numberOfLines={1}
			>
				{firstName} {lastName}
			</Typography>
			<Typography type="washed" className="text-center" numberOfLines={1}>
				{coach}
			</Typography>
			<Typography type="washed" className="text-center" numberOfLines={1}>
				{coach}
			</Typography>
			<View className="flex-row gap-2 mt-auto">
				<Button
					text="Edytuj"
					size="small"
					variant="secondary"
					className="!h-8"
					rounded
					onPress={onEdit}
				/>
			</View>
		</View>
	);
};

export default TeamManageDialog;
