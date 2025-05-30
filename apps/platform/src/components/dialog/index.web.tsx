import {
	Dialog as HeadlessDialog,
	DialogPanel as HeadlessDialogPanel,
} from "@headlessui/react";
import { X } from "lucide-react-native";
import { cloneElement, useState } from "react";
import type { PressableProps } from "react-native";
import type { DialogProps } from "#/components/dialog/types";

const Dialog: React.FC<DialogProps> = ({
	children,
	trigger,
	onOpen,
	onClose,
	...props
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const open = () => {
		setIsOpen(true);
		onOpen?.();
	};

	const close = () => {
		setIsOpen(false);
		onClose?.();
	};

	return (
		<>
			{trigger &&
				cloneElement(trigger as React.ReactElement<PressableProps>, {
					onPress: open,
				})}
			<HeadlessDialog open={isOpen} onClose={close} {...props}>
				<div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-[#00000095]">
					<HeadlessDialogPanel className="relative w-full max-w-xl bg-white rounded-3xl">
						<>
							{typeof children === "function"
								? children({ open, close })
								: children}
							<button
								type="button"
								className="absolute top-4 right-5 p-1 bg-gray-100 rounded-full"
								onClick={close}
							>
								<X size={18} className="text-gray-600" />
							</button>
						</>
					</HeadlessDialogPanel>
				</div>
			</HeadlessDialog>
		</>
	);
};

export default Dialog;
