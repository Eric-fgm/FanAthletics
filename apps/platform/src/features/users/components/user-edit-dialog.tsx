import type { User } from "@fan-athletics/shared/types";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { Button, Dialog, FormField, Input, Typography } from "#/components";
import { useCurrentUserMutation } from "#/features/auth";

interface FormValues {
	name: string;
	note: string;
	email: string;
}

interface UserEditDialogProps {
	trigger?: React.ReactNode;
	user: User;
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({ trigger, user }) => {
	const { mutateAsync: updateUser, isPending } = useCurrentUserMutation();
	const { control, handleSubmit } = useForm<FormValues>({
		values: { name: user.name, email: user.email, note: user.note },
	});

	return (
		<Dialog trigger={trigger}>
			{({ close }) => (
				<View>
					<Typography size="large" className="text-center py-4">
						Edytuj profil
					</Typography>
					<View className="py-4 px-6 gap-4 grid grid-cols-2">
						<FormField
							name="name"
							label="Nazwa"
							control={control}
							rules={{ required: "To pole jest wymagane" }}
						>
							<Input placeholder={user.name} />
						</FormField>
						<FormField name="email" label="Email" control={control}>
							<Input disabled />
						</FormField>
						<FormField
							name="note"
							label="Dodatkowe informacje"
							control={control}
							rules={{ required: "To pole jest wymagane" }}
							className="col-span-2"
						>
							<Input placeholder="Skąd się o nas dowiedziałeś" />
						</FormField>
					</View>
					<View className="py-6 px-5 grid grid-cols-2 gap-4">
						<Button text="Anuluj" variant="outlined" rounded onPress={close} />
						<Button
							text="Zapisz"
							rounded
							isLoading={isPending}
							onPress={handleSubmit(({ email, ...values }) =>
								updateUser(values).then(close).catch(),
							)}
						/>
					</View>
				</View>
			)}
		</Dialog>
	);
};

export default UserEditDialog;
