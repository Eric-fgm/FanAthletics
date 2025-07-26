import { useState } from "react";
import { useForm } from "react-hook-form";
import { Text, View } from "react-native";
import {
	Button,
	Dialog,
	FormField,
	Input,
	Toggle,
	Typography,
} from "#/components";
import { useEventCreateMutation } from "#/features/admin";

interface FormValues {
	name: string;
	organization: string;
	image: string;
	icon: string;
	domtelApp: string;
}

interface EventCreateDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

const EventCreateDialog: React.FC<EventCreateDialogProps> = (props) => {
	const [withDomtel, setWithDomtel] = useState(false);

	const { mutateAsync: createEvent } = useEventCreateMutation();

	const {
		formState: { isSubmitting },
		control,
		reset,
		handleSubmit,
	} = useForm<FormValues>({
		values: { name: "", organization: "", image: "", icon: "", domtelApp: "" },
		shouldUnregister: true,
	});

	return (
		<Dialog {...props}>
			{({ close }) => (
				<View>
					<Typography size="large" className="py-4 text-center">
						Stwórz wydarzenie
					</Typography>
					<View className="gap-4 px-6 py-4">
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
							<FormField name="image" label="Zdjęcie" control={control}>
								<Input placeholder="Url zdjęcia" />
							</FormField>
							<FormField name="icon" label="Ikonka" control={control}>
								<Input placeholder="Url ikonki" />
							</FormField>
						</View>
						<View>
							<View className="flex-row justify-between items-center">
								<Typography>Uzyj serwisu Domtel</Typography>
								<Toggle value={withDomtel} onChangeValue={setWithDomtel} />
							</View>
							<Text className="mt-1 pr-8 text-[13px]">
								Tylko zaproszeni członkowie oraz osoby mające określone role
								będą mogły wyświetlać ten kanał.
							</Text>
						</View>
						{withDomtel && (
							<FormField
								name="domtelApp"
								label="Domtel"
								control={control}
								rules={{ required: "To pole jest wymagane" }}
							>
								<Input placeholder="Domena Domtel" />
							</FormField>
						)}
					</View>
					<View className="gap-4 grid grid-cols-2 px-5 py-6">
						<Button text="Anuluj" variant="outlined" rounded onPress={close} />
						<Button
							text="Stwórz"
							rounded
							isLoading={isSubmitting}
							onPress={handleSubmit(async (values) => {
								try {
									await createEvent(values);
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

export default EventCreateDialog;
