import {
	Dialog as HeadlessDialog,
	DialogPanel as HeadlessDialogPanel,
} from "@headlessui/react";
import { X } from "lucide-react-native";
import { cloneElement, useEffect, useState } from "react";
import type { PressableProps } from "react-native";
import type { DialogProps } from "#/components/dialog/types";

const Dialog: React.FC<DialogProps> = ({
	children,
	trigger,
	isOpen = null,
	onOpen,
	onClose,
	...props
}) => {
	const [isDialogOpen, setIsDialogOpen] = useState(!!isOpen);

	const open = () => {
		if (isOpen === null) {
			setIsDialogOpen(true);
		}
		onOpen?.();
	};

	const close = () => {
		if (isOpen === null) {
			setIsDialogOpen(false);
		}
		onClose?.();
	};

	useEffect(() => {
		if (isOpen !== null) {
			setIsDialogOpen(isOpen);
		}
	}, [isOpen]);

	return (
		<>
			{trigger &&
				cloneElement(trigger as React.ReactElement<PressableProps>, {
					onPress: open,
				})}
			<HeadlessDialog open={isDialogOpen} onClose={close} {...props}>
				<div className="fixed inset-0 flex justify-center items-center bg-[#00000095] p-4 w-screen">
					<HeadlessDialogPanel className="relative bg-white rounded-3xl w-full max-w-xl">
						<>
							{typeof children === "function"
								? children({ open, close })
								: children}
							<button
								type="button"
								className="top-4 right-5 absolute bg-gray-100 p-1 rounded-full"
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
