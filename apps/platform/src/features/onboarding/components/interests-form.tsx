import { useFormContext } from "react-hook-form";
import { View } from "react-native";
import { Button, Typography } from "#/components";

interface InterestsFormProps {
	onPressNext: () => void;
}

const InterestsForm: React.FC<InterestsFormProps> = ({ onPressNext }) => {
	const {
		formState: { isSubmitting },
	} = useFormContext();

	return (
		<View className="mx-auto pt-24 w-full max-w-sm">
			<Typography size="large2" className="text-center">
				Wybierz ulubione dyscypliny
			</Typography>
			<Typography type="washed" className="mt-1 mb-8 text-center">
				Już prawie kończymy
			</Typography>
			<View className="gap-y-4">
				<View className="flex-row flex-wrap">
					<View className="bg-gray-100 px-6 py-4 rounded-xl">
						<Typography>Piłka nożna</Typography>
					</View>
				</View>
				<Button text="Zakończ" isLoading={isSubmitting} onPress={onPressNext} />
				<Typography size="small" type="washed" className="text-center">
					Warunki świadczenia usług i Politykę prywatności.
				</Typography>
			</View>
		</View>
	);
};

export default InterestsForm;
