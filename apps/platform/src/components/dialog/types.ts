import type { DialogProps as HeadlessDialogProps } from "@headlessui/react";
import type { ModalizeProps } from "react-native-modalize";

export interface DialogProps {
	children?:
		| ((actions: { open: () => void; close: () => void }) => React.ReactNode)
		| React.ReactNode;
	trigger?: React.ReactNode;
	isOpen?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
	webOptions?: HeadlessDialogProps;
	nativeOptions?: ModalizeProps;
}
