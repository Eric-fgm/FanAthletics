import { HelpCircle } from "lucide-react-native";
import React from "react";
import { Button, Dropdown } from "#/components";
import {
	useCurrentUserMutation,
	useSessionSuspeneQuery,
} from "#/features/auth";
import { isAdmin } from "#/helpers/user";

const DevTools = () => {
	const { data: session } = useSessionSuspeneQuery();
	const { mutate: updateUser } = useCurrentUserMutation();

	return (
		<Dropdown
			trigger={<Button icon={HelpCircle} />}
			items={[
				isAdmin(session?.user)
					? {
							name: "Ustaw role uzytkownik",
							onPress: () => updateUser({ role: "user" }),
						}
					: {
							name: "Ustaw role admin",
							onPress: () => updateUser({ role: "admin" }),
						},
			]}
		/>
	);
};

export default DevTools;
