import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Avatar, Button, Typography } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import { UserEditDialog, useUserQuery } from "#/features/users";

export default function UserProfile() {
	const { id } = useLocalSearchParams();
	const { data: user } = useUserQuery(id.toString());
	const { data: session } = useSessionSuspeneQuery();

	if (!user) {
		return null;
	}

	const { name, email, image } = { ...user, ...session?.user };

	return (
		<View className="pt-16 pb-8 items-center">
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
		</View>
	);
}
