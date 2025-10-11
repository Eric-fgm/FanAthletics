import type { Event } from "@fan-athletics/shared/types";
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
import { useEventUpdateMutation } from "#/features/admin";

interface EventUpdateDialogProps {
	isOpen: boolean;
	onClose: () => void;
	values: Event;
}

const EventUpdateDialog: React.FC<EventUpdateDialogProps> = ({
	values,
	...props
}) => {
	const { mutateAsync: updateEvent } = useEventUpdateMutation();

	const {
		formState: { isSubmitting },
		control,
		reset,
		setValue,
		watch,
		handleSubmit,
	} = useForm<Event>({
		values,
	});

	const status = watch("status");

	return (
		<Dialog {...props}>
			{({ close }) => (
				<View>
					<Typography size="large" className="py-4 text-center">
						Edytuj wydarzenie
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
								<Typography>Status wydarzenia</Typography>
								<Toggle
									value={status === "available"}
									onChangeValue={() =>
										setValue(
											"status",
											status === "available" ? "unavailable" : "available",
										)
									}
								/>
							</View>
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
								const {
									domtelApp,
									startAt,
									endAt,
									updatedAt,
									createdAt,
									...restValues
								} = values;

								try {
									await updateEvent(restValues);
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

export default EventUpdateDialog;
