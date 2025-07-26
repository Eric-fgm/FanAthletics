import type React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useCurrentUserMutation } from "#/features/auth";

interface FormsProviderProps {
	children?:
		| ((props: { submit: () => void }) => React.ReactNode)
		| React.ReactNode;
	defaultValues: Partial<OnboardingValuesForm>;
}

export interface OnboardingValuesForm {
	name: string;
	note: string;
}

const FormsProvider: React.FC<FormsProviderProps> = ({
	children,
	defaultValues,
}) => {
	const methods = useForm<OnboardingValuesForm>({
		values: { name: "", note: "", ...defaultValues },
	});
	const { mutateAsync: updateCurrentUser } = useCurrentUserMutation();

	return (
		<FormProvider {...methods}>
			{typeof children === "function"
				? children({
						submit: methods.handleSubmit((values) =>
							updateCurrentUser(values).catch(),
						),
					})
				: children}
		</FormProvider>
	);
};

export default FormsProvider;
