import { useForm } from "react-hook-form";
import { View } from "react-native";
import { Button, Dialog, FormField, Input, Typography } from "#/components";
import { useEventCreatedMutation } from "#/features/events";

interface FormValues {
	name: string;
	organization: string;
	image: string,
	icon: string,
}

interface EventCreateDialogProps {
	trigger?: React.ReactNode;
}

const EventCreateDialog: React.FC<EventCreateDialogProps> = ({ trigger }) => {
	const { mutateAsync: postEvent, isPending } = useEventCreatedMutation();
	const { control, handleSubmit } = useForm<FormValues>({
		values: {name: "", organization: "", image: "", icon: ""}
	});

	return (
		<Dialog trigger={trigger}>
			{({ close }) => (
				<View>
					<Typography size="large" className="text-center py-4">
						Stwórz wydarzenie
					</Typography>
					<View className="py-4 px-6">
						<View className="grid sm:grid-cols-2 gap-4">
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
							<FormField 
								name="image"
								label="Zdjecie"
								control={control}
								>
								<Input placeholder="Url zdjęcia"></Input>
							</FormField>
							<FormField 
								name="icon"
								label="Ikonka"
								control={control}
								>
								<Input placeholder="Url ikonki"></Input>
							</FormField>
						</View>
					</View>
					<View className="py-6 px-5 grid grid-cols-2 gap-4">
						<Button text="Anuluj" variant="outlined" rounded onPress={close} />
						<Button text="Stwórz" rounded onPress={handleSubmit((values) => {postEvent(values).then(close).catch()})} />
					</View>
				</View>
			)}
		</Dialog>
	);
};

export default EventCreateDialog;
