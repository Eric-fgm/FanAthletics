import { Redirect } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSessionSuspeneQuery } from "#/features/auth";
import {
	FormsProvider,
	Header,
	IterestsForm,
	PersonalInfoForm,
} from "#/features/onboarding";
import { shouldBeOnboarded } from "#/helpers/user";

export default function Onboarding() {
	const { data: session } = useSessionSuspeneQuery();
	const [currentStep, setCurrentStep] = useState(1);

	if (!session) {
		return <Redirect href="/sign-in" />;
	}

	if (!shouldBeOnboarded(session.user)) {
		return <Redirect href="/" />;
	}

	return (
		<View className="px-4 md:px-8 xl:px-24">
			<Header steps={(currentStep - 1) / 2} />
			<FormsProvider defaultValues={{ name: session.user.name }}>
				{({ submit }) => (
					<>
						{currentStep === 1 && (
							<PersonalInfoForm onPressNext={() => setCurrentStep(2)} />
						)}
						{currentStep === 2 && <IterestsForm onPressNext={submit} />}
					</>
				)}
			</FormsProvider>
		</View>
	);
}
