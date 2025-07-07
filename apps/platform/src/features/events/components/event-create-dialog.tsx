import { useForm } from "react-hook-form";
import { View } from "react-native";
import { Button, Dialog, FormField, Input, Typography } from "#/components";
import { useEventCreatedMutation } from "#/features/events";

interface FormValues {
	name: string;
	organization: string;
	image: string;
	icon: string;
}

interface EventCreateDialogProps {
	trigger?: React.ReactNode;
}

const EventCreateDialog: React.FC<EventCreateDialogProps> = ({ trigger }) => {
	const { mutateAsync: postEvent, isPending } = useEventCreatedMutation();
	const { control, handleSubmit } = useForm<FormValues>({
		values: { name: "", organization: "", image: "", icon: "" },
	});

	return (
		<Dialog trigger={trigger}>
			{({ close }) => (
				<View>
					<Typography size="large" className="py-4 text-center">
						Stwórz wydarzenie
					</Typography>
					<View className="px-6 py-4">
						<View className="gap-4 grid sm:grid-cols-2">
							<FormField
								name="name"
								label="Nazwa"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Np. Igrzyska Olimpijskie" />
							</FormField>
							<FormField
								name="organization"
								label="Organizacja"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Np. European Athletics" />
							</FormField>
							<FormField name="image" label="Zdjecie" control={control}>
								<Input placeholder="Url zdjęcia" />
							</FormField>
							<FormField name="icon" label="Ikonka" control={control}>
								<Input placeholder="Url ikonki" />
							</FormField>
						</View>
					</View>
					<View className="gap-4 grid grid-cols-2 px-5 py-6">
						<Button text="Anuluj" variant="outlined" rounded onPress={close} />
						<Button
							text="Stwórz"
							rounded
							onPress={handleSubmit((values) => {
								postEvent(values).then(close).catch();
							})}
						/>
					</View>
				</View>
			)}
		</Dialog>
	);
};

export default EventCreateDialog;
