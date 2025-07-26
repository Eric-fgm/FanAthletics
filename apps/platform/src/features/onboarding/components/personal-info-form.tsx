import { useFormContext } from "react-hook-form";
import { View } from "react-native";
import { Button, FormField, Input, Typography } from "#/components";
import type { OnboardingValuesForm } from "./forms-provider";

interface PersonalInfoFormProps {
	onPressNext: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ onPressNext }) => {
	const { control } = useFormContext<OnboardingValuesForm>();

	return (
		<View className="mx-auto pt-24 w-full max-w-sm">
			<Typography size="large2" className="text-center">
				Witaj na Olympics!
			</Typography>
			<Typography type="washed" className="mt-1 mb-8 text-center">
				Jeszcze kilka kroków
			</Typography>
			<View className="gap-y-4">
				<FormField
					name="name"
					control={control}
					rules={{ required: "To pole jest wymagane" }}
				>
					<Input placeholder="Nazwa" />
				</FormField>
				<FormField
					name="note"
					control={control}
					rules={{ required: "To pole jest wymagane" }}
				>
					<Input placeholder="Skąd się o nas dowiedziałeś?" />
				</FormField>
				<Button text="Kontynuuj" onPress={onPressNext} />
				<Typography size="small" type="washed" className="text-center">
					Warunki świadczenia usług i Politykę prywatności.
				</Typography>
			</View>
		</View>
	);
};

export default PersonalInfoForm;
