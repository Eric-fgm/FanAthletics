import { useGlobalSearchParams } from "expo-router";
import { Settings } from "lucide-react-native";
import React, { useState } from "react";
import { Button, Dropdown } from "#/components";
import { EventCreateDialog, useEventPullMutation } from "#/features/admin";

const AdminTools = () => {
	const { eventId } = useGlobalSearchParams();

	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
	const { mutate: pullEvent, isPending } = useEventPullMutation();

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
