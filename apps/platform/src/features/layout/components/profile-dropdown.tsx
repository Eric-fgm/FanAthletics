import { useRouter } from "expo-router";
import { Platform, View } from "react-native";
import { Button, Dropdown, Typography } from "#/components";
import { useSessionSuspeneQuery, useSignOutMutation } from "#/features/auth";

interface ProfileDropdownProps {
	trigger: React.ReactNode;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ trigger }) => {
	const { data: session } = useSessionSuspeneQuery();
	const { mutate: signOut } = useSignOutMutation();
	const router = useRouter();

	const mobileItems =
		Platform.OS !== "web"
			? [
					{
						name: "Zobacz profil",
						onPress: () => router.push(`/users/${session?.user.id}`),
					},
				]
			: [];

	return (
		session && (
			<Dropdown
				trigger={trigger}
				items={[
					...mobileItems,
					{ name: "Ustawienia" },
					{
						name: "Wyloguj się",
						className: "text-red-700",
						onPress: signOut,
					},
				]}
				renderNativeHeader={
					<View className="px-6 py-4">
						<Typography>{session.user.name}</Typography>
						<Typography type="washed" size="small" className="mt-1">
							{session.user.email}
						</Typography>
					</View>
				}
				renderNativeFooter={
					<View className="flex-row gap-2 px-5 py-4">
						<Typography type="washed" size="small">
							Privacy
						</Typography>
						<Typography type="washed" size="small">
							Terms
						</Typography>
					</View>
				}
				renderWebHeader={({ close }) => (
					<View className="px-5 py-4">
						<Typography type="bright">{session.user.name}</Typography>
						<Typography
							type="washed-bright"
							size="small"
							className="mt-1 mb-2.5"
						>
							{session.user.email}
						</Typography>
						<Button
							href={`/users/${session.user.id}`}
							onPress={close}
							variant="bright"
							text="Zobacz profil"
							rounded
							size="small"
						/>
					</View>
				)}
				renderWebFooter={
					<View className="flex-row gap-2 px-5 py-4">
						<Typography type="washed-bright" size="small">
							Privacy
						</Typography>
						<Typography type="washed-bright" size="small">
							Terms
						</Typography>
					</View>
				}
			/>
		)
	);
};

export default ProfileDropdown;
