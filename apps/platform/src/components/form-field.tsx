import { Children, cloneElement } from "react";
import {
	type Control,
	type FieldValues,
	type Path,
	type UseControllerProps,
	useController,
} from "react-hook-form";
import { View } from "react-native";
import { Typography } from "#/components";

interface FormFieldProps<T extends FieldValues>
	extends React.PropsWithChildren {
	label?: string;
	name: Path<T>;
	rules?: UseControllerProps<T>["rules"];
	control: Control<T>;
	className?: string;
}

const FormField = <T extends FieldValues>({
	children,
	label,
	name,
	rules,
	control,
	className,
}: FormFieldProps<T>) => {
	const { field, fieldState } = useController({
		name,
		control,
		rules,
	});

	return (
		<View className={className}>
			{label && <Typography className="mb-2 text-sm">{label}</Typography>}
			{Children.map(children, (child) =>
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				cloneElement(child as React.ReactElement<any>, {
					ref: field.ref,
					value: field.value,
					onChangeValue: field.onChange,
					onChangeText: field.onChange,
					onBlur: field.onBlur,
				}),
			)}
			{fieldState.error && (
				<Typography type="danger" className="mt-2 text-sm">
					{fieldState.error.message}
				</Typography>
			)}
		</View>
	);
};

export default FormField;
