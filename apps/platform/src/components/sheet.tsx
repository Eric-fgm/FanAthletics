import { cloneElement } from "react";
import { View, type PressableProps } from "react-native";
import {
	Modalize,
	type ModalizeProps,
	useModalize,
} from "react-native-modalize";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SheetProps extends Omit<ModalizeProps, "children"> {
	trigger?: React.ReactNode;
	children?:
	| ((actions: { open: () => void; close: () => void }) => React.ReactNode)
	| React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ children, trigger, ...props }) => {
	const { ref, open, close } = useModalize();
	const insets = useSafeAreaInsets();

	return (
		<>
			{trigger &&
				cloneElement(trigger as React.ReactElement<PressableProps>, {
					onPress: () => open(),
				})}
			<Modalize ref={ref} withReactModal modalTopOffset={insets.top} handlePosition="inside" {...props}>
				<View style={{ paddingBottom: insets.bottom }} >
					{typeof children === "function" ? children({ open, close }) : children}
				</View>
			</Modalize>
		</>
	);
};

export default Sheet;
