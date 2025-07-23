import { useLocalSearchParams } from "expo-router";
import { Settings } from "lucide-react-native";
import React, { useState } from "react";
import { Button, Dropdown } from "#/components";
import { EventCreateDialog, useEventPullMutation } from "#/features/admin";

const AdminTools = () => {
	const { eventId } = useLocalSearchParams();
	const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
	const { mutate: pullEvent } = useEventPullMutation();

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
						name: "Pobierz danę",
						disabled: typeof eventId !== "string",
						onPress: () => {
							pullEvent(eventId.toString());
						},
					},
				]}
			/>
			<EventCreateDialog
				isOpen={isEventDialogOpen}
				onClose={() => setIsEventDialogOpen(false)}
			/>
		</>
	);
};

export default AdminTools;
