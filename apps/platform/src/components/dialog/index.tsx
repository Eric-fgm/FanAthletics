import { useEffect, useRef } from "react";
import type { Modalize } from "react-native-modalize";
import type { DialogProps } from "#/components/dialog/types";
import Sheet from "#/components/sheet";

const Dialog: React.FC<DialogProps> = ({
	children,
	trigger,
	nativeOptions,
	isOpen,
	onOpen,
	onClose,
}) => {
	const ref = useRef<Modalize>(null);

	useEffect(() => {
		if (typeof isOpen !== "boolean") return;
		if (isOpen) {
			ref.current?.open();
		} else {
			ref.current?.close();
		}
	}, [isOpen]);

	return (
		<Sheet
			ref={ref}
			trigger={trigger}
			onOpen={onOpen}
			onClose={onClose}
			{...nativeOptions}
		>
			{(actions) =>
				typeof children === "function" ? children(actions) : children
			}
		</Sheet>
	);
};

export default Dialog;
