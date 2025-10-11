import type { Athlete } from "@fan-athletics/shared/types";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { Button, Dialog, FormField, Input, Typography } from "#/components";
import { useAthleteUpdateMutation } from "#/features/admin";

interface AthleteUpdateDialogProps {
	isOpen: boolean;
	onClose: () => void;
	values: Athlete;
}

const AthleteUpdateDialog: React.FC<AthleteUpdateDialogProps> = ({
	values,
	...props
}) => {
	const { mutateAsync: updateAthlete } = useAthleteUpdateMutation();

	const {
		formState: { isSubmitting },
		control,
		reset,
		handleSubmit,
	} = useForm<Athlete>({
		values,
	});

	return (
		<Dialog {...props}>
			{({ close }) => (
				<View>
					<Typography size="large" className="py-4 text-center">
						Edytuj dyscypline
					</Typography>
					<View className="gap-4 px-6 py-4">
						<View className="gap-4 grid sm:grid-cols-2">
							<FormField
								name="firstName"
								label="Imię"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Imię" />
							</FormField>
							<FormField
								name="lastName"
								label="Nazwisko"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Nazwisko" />
							</FormField>
							<FormField
								name="cost"
								label="Koszt"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Koszt" />
							</FormField>
							<FormField
								name="coach"
								label="Klub"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Klub" />
							</FormField>
						</View>
						<View>
							<Text className="mt-1 pr-8 text-[13px]">
								Tylko zaproszeni członkowie oraz osoby mające określone role
								będą mogły wyświetlać ten kanał.
							</Text>
						</View>
					</View>
					<View className="gap-4 grid grid-cols-2 px-5 py-6">
						<Button text="Anuluj" variant="outlined" rounded onPress={close} />
						<Button
							text="Edytuj"
							rounded
							isLoading={isSubmitting}
							onPress={handleSubmit(async (values) => {
								const { eventId, updatedAt, createdAt, ...restValues } = values;

								try {
									await updateAthlete(restValues);
									reset();
									close();
								} catch (error) {}
							})}
						/>
					</View>
				</View>
			)}
		</Dialog>
	);
};

export default AthleteUpdateDialog;
