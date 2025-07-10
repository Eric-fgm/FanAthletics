import type { MenuProps as HeadlessMenuProps } from "@headlessui/react";
import type { ModalizeProps } from "react-native-modalize";

export interface DropdownProps {
	trigger?: React.ReactNode;
	items: { name: string; className?: string; onPress?: () => void }[];
	className?: string;
	renderWebHeader?:
		| React.ReactNode
		| ((props: { close: () => void }) => React.ReactNode);
	renderWebFooter?: React.ReactNode;
	renderNativeHeader?: React.ReactNode;
	renderNativeFooter?: React.ReactNode;
	webOptions?: HeadlessMenuProps;
	nativeOptions?: ModalizeProps;
}
