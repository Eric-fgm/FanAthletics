import { View } from "react-native";
import { Button, Dropdown, Typography } from "#/components";
import { useSignOutMutation } from "#/features/auth";

interface ProfileDropdownProps {
	trigger: React.ReactNode;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ trigger }) => {
	const { mutate: signOut } = useSignOutMutation();

	return (
		<Dropdown
			trigger={trigger}
			items={[
				{ name: "Ustawienia" },
				{
					name: "Wyloguj się",
					className: "text-red-700",
					onPress: signOut,
				},
			]}
			renderNativeHeader={
				<View className="py-4 px-6">
					<Typography>Jan Kowalski</Typography>
					<Typography type="washed" size="small" className="mt-1">
						jan.kowalski@gmail.com
					</Typography>
				</View>
			}
			renderNativeFooter={
				<View className="py-4 px-5 flex-row gap-2">
					<Typography type="washed" size="small">
						Privacy
					</Typography>
					<Typography type="washed" size="small">
						Terms
					</Typography>
				</View>
			}
			renderWebHeader={
				<View className="py-4 px-5">
					<Typography type="bright">Jan Kowalski</Typography>
					<Typography type="washed-bright" size="small" className="mt-1 mb-2.5">
						jan.kowalski@gmail.com
					</Typography>
					<Button variant="bright" text="Zobacz profil" rounded size="small" />
				</View>
			}
			renderWebFooter={
				<View className="py-4 px-5 flex-row gap-2">
					<Typography type="washed-bright" size="small">
						Privacy
					</Typography>
					<Typography type="washed-bright" size="small">
						Terms
					</Typography>
				</View>
			}
		/>
	);
};

export default ProfileDropdown;
