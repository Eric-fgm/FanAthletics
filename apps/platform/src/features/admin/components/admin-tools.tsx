import { Settings } from "lucide-react-native";
import React, { useState } from "react";
import { Button, Dropdown } from "#/components";
import {
	AthleteUpdateDialog,
	DisciplineUpdateDialog,
	EventCreateDialog,
	EventUpdateDialog,
	useEventPullMutation,
} from "#/features/admin";
import {
	useAthleteQuery,
	useDisciplineQuery,
	useEventQuery,
} from "#/features/events";
import {
	useCountPointsMutation,
	useInvalidateParticipation,
} from "#/features/participation";
import { useGlobalSearchParams } from "expo-router";

const AdminTools = () => {
	const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
	const [isUpdateEventDialogOpen, setIsUpdateEventDialogOpen] = useState(false);
	const [isUpdateDisciplineDialogOpen, setIsUpdateDisciplineDialogOpen] =
		useState(false);
	const [isUpdateAthleteDialogOpen, setIsUpdateAthleteDialogOpen] =
		useState(false);
		
	const { eventId } = useGlobalSearchParams();

	const { data: event } = useEventQuery();
	const { data: discipline } = useDisciplineQuery();
	const { data: athlete } = useAthleteQuery();
	const { mutate: pullEvent, isPending } = useEventPullMutation();
	const { mutateAsync: countPoints, isPending: isCountPointsPending } =
		useCountPointsMutation();
	const { invalidate: invalidateParticipation } = useInvalidateParticipation();

	return (
		<>
			<Dropdown
				trigger={<Button icon={Settings} />}
				items={[
					{
						name: "Stwórz wydarzenie",
						onPress: () => {
							setIsCreateEventDialogOpen(true);
						},
					},
					...(event
						? [
								{
									name: "Edytuj wydarzenie",
									onPress: () => {
										setIsUpdateEventDialogOpen(true);
									},
								},
								{
									name: isPending ? "Trwa pobieranie..." : "Pobierz dane",
									disabled: isPending,
									onPress: () => {
										pullEvent(event.id);
									},
								},
							]
						: []),
					...(discipline
						? [
								{
									name: "Edytuj dyscypline",
									onPress: () => {
										setIsUpdateDisciplineDialogOpen(true);
									},
								},
							]
						: []),
					...(athlete
						? [
								{
									name: "Edytuj zawodnika",
									onPress: () => {
										setIsUpdateAthleteDialogOpen(true);
									},
								},
							]
						: []),
					{
						name: isCountPointsPending
							? "Trwa obliczanie punktów..."
							: "Oblicz punkty",
						disabled: typeof eventId !== "string" || isCountPointsPending,
						onPress: async () => {
							console.log("Liczenie...");
							await countPoints(eventId.toString());
							await invalidateParticipation(eventId.toString());
						},
					},
				]}
				className="-mt-4"
			/>
			<EventCreateDialog
				isOpen={isCreateEventDialogOpen}
				onClose={() => setIsCreateEventDialogOpen(false)}
			/>
			{event && (
				<EventUpdateDialog
					isOpen={isUpdateEventDialogOpen}
					onClose={() => setIsUpdateEventDialogOpen(false)}
					values={event}
				/>
			)}
			{discipline && (
				<DisciplineUpdateDialog
					isOpen={isUpdateDisciplineDialogOpen}
					onClose={() => setIsUpdateDisciplineDialogOpen(false)}
					values={discipline}
				/>
			)}
			{athlete && (
				<AthleteUpdateDialog
					isOpen={isUpdateAthleteDialogOpen}
					onClose={() => setIsUpdateAthleteDialogOpen(false)}
					values={athlete}
				/>
			)}
		</>
	);
};

export default AdminTools;
