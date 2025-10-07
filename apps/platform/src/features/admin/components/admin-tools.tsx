import { useGlobalSearchParams } from "expo-router";
import { Settings } from "lucide-react-native";
import React, { useState } from "react";
import { Button, Dropdown } from "#/components";
import { EventCreateDialog, useEventPullMutation } from "#/features/admin";
import {
	useCountPointsMutation,
	useInvalidateParticipation,
} from "#/features/participation";

const AdminTools = () => {
	const { eventId } = useGlobalSearchParams();

	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
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
							setIsEventDialogOpen(true);
						},
					},
					{
						name: isPending ? "Trwa pobieranie..." : "Pobierz dane",
						disabled: typeof eventId !== "string" || isPending,
						onPress: () => {
							pullEvent(eventId.toString());
						},
					},
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
				isOpen={isEventDialogOpen}
				onClose={() => setIsEventDialogOpen(false)}
			/>
		</>
	);
};

export default AdminTools;
