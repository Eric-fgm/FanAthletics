import type { DialogProps } from "#/components/dialog/types";
import Sheet from "#/components/sheet";

const Dialog: React.FC<DialogProps> = ({
	children,
	trigger,
	nativeOptions,
	onOpen,
	onClose,
}) => {
	return (
		<Sheet
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
