import { View } from "react-native";
import { Button, Typography } from "#/components";

interface InterestsFormProps {
	onPressNext: () => void;
}

const InterestsForm: React.FC<InterestsFormProps> = ({ onPressNext }) => {
	return (
		<View className="pt-24 mx-auto w-full max-w-sm">
			<Typography size="large2" className="text-center">
				Wybierz ulubione dyscypliny
			</Typography>
			<Typography type="washed" className="mt-1 mb-8 text-center">
				Już prawie kończymy
			</Typography>
			<View className="gap-y-4">
				<View className="flex-wrap flex-row">
					<View className="px-6 py-4 rounded-xl bg-gray-100">
						<Typography>Piłka nożna</Typography>
					</View>
				</View>
				<Button text="Zakończ" onPress={onPressNext} />
				<Typography size="small" type="washed" className="text-center">
					Warunki świadczenia usług i Politykę prywatności.
				</Typography>
			</View>
		</View>
	);
};

export default InterestsForm;
