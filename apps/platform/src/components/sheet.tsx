import { cloneElement } from "react";
import type { PressableProps } from "react-native";
import {
	Modalize,
	type ModalizeProps,
	useModalize,
} from "react-native-modalize";

interface SheetProps extends Omit<ModalizeProps, "children"> {
	trigger?: React.ReactNode;
	children?:
		| ((actions: { open: () => void; close: () => void }) => React.ReactNode)
		| React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ children, trigger, ...props }) => {
	const { ref, open, close } = useModalize();

	return (
		<>
			{trigger &&
				cloneElement(trigger as React.ReactElement<PressableProps>, {
					onPress: () => open(),
				})}
			<Modalize ref={ref} withReactModal {...props}>
				{typeof children === "function" ? children({ open, close }) : children}
			</Modalize>
		</>
	);
};

export default Sheet;
