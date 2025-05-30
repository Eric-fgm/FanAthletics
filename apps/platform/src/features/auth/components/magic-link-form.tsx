import { useForm } from "react-hook-form";
import { View } from "react-native";
import { Button, FormField, Input, Typography } from "#/components";

interface FormValues {
	email: string;
}

interface MagicLinkFormProps {
	isLoading: boolean;
	onSubmit: (values: FormValues) => void;
}

const MagicLinkForm: React.FC<MagicLinkFormProps> = ({
	isLoading,
	onSubmit,
}) => {
	const { control, handleSubmit } = useForm<FormValues>({
		values: { email: "" },
	});

	return (
		<View>
			<FormField
				name="email"
				control={control}
				rules={{ required: "To pole jest wymagane" }}
				className="mb-4"
			>
				<Input placeholder="Wprowadź adres email" />
			</FormField>
			<Button
				text="Kontynuuj"
				isLoading={isLoading}
				onPress={handleSubmit(onSubmit)}
			/>
			<Typography size="small" type="washed" className="mt-2">
				Kontynuując, wyrażasz zgodę na Warunki świadczenia usług i Politykę
				prywatności.
			</Typography>
		</View>
	);
};

export default MagicLinkForm;
