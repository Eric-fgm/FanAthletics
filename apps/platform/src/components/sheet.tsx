import type React from "react";
import { cloneElement, forwardRef, useImperativeHandle, useRef } from "react";
import { type PressableProps, View } from "react-native";
import {
	Modalize,
	type ModalizeProps,
	useModalize,
} from "react-native-modalize";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SheetProps extends Omit<ModalizeProps, "children"> {
	trigger?: React.ReactNode;
	children?:
		| ((actions: { open: () => void; close: () => void }) => React.ReactNode)
		| React.ReactNode;
}

const Sheet = forwardRef<Modalize, SheetProps>(
	({ children, trigger, ...props }, ref) => {
		const { ref: modalizeRef, open, close } = useModalize();
		const insets = useSafeAreaInsets();

		useImperativeHandle(
			ref,
			() => ({
				open: () => open(),
				close: () => close(),
			}),
			[open, close],
		);

		return (
			<>
				{trigger &&
					cloneElement(trigger as React.ReactElement<PressableProps>, {
						onPress: () => open(),
					})}
				<Modalize
					ref={modalizeRef}
					withReactModal
					modalTopOffset={insets.top}
					handlePosition="inside"
					{...props}
				>
					<View style={{ paddingBottom: insets.bottom }}>
						{typeof children === "function"
							? children({ open, close })
							: children}
					</View>
				</Modalize>
			</>
		);
	},
);

export default Sheet;
