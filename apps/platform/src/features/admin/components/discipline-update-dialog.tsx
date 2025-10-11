import type { Discipline } from "@fan-athletics/shared/types";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { Button, Dialog, FormField, Input, Typography } from "#/components";
import { useDisciplineUpdateMutation } from "#/features/admin";

interface DisciplineUpdateDialogProps {
	isOpen: boolean;
	onClose: () => void;
	values: Discipline;
}

const DisciplineUpdateDialog: React.FC<DisciplineUpdateDialogProps> = ({
	values,
	...props
}) => {
	const { mutateAsync: updateDiscipline } = useDisciplineUpdateMutation();

	const {
		formState: { isSubmitting },
		control,
		reset,
		handleSubmit,
	} = useForm<Discipline>({
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
								name="name"
								label="Nazwa"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Nazwa" />
							</FormField>
							<FormField
								name="organization"
								label="Organizacja"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Organizacja" />
							</FormField>
							<FormField
								name="record"
								label="Rekord"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Rekord" />
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
									await updateDiscipline(restValues);
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

export default DisciplineUpdateDialog;
