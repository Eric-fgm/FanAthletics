import { Pressable, View } from "react-native";
import { Divider, Typography } from "#/components";
import type { DropdownProps } from "#/components/dropdown/types";
import Sheet from "#/components/sheet";

const Dropdown: React.FC<DropdownProps> = ({
	trigger,
	items,
	renderNativeHeader,
	renderNativeFooter,
	nativeOptions,
}) => {
	return (
		<Sheet trigger={trigger} adjustToContentHeight {...nativeOptions}>
			{({ close }) => (
				<>
					{renderNativeHeader && (
						<>
							{renderNativeHeader}
							<Divider />
						</>
					)}
					<View className="py-2">
						{items.map(({ name, disabled, className = "", onPress }) => (
							<Pressable
								key={name}
								className={`px-6 py-3 ${className} ${disabled ? "opacity-40 pointer-events-none" : ""}`}
								onPress={() => {
									close();
									setTimeout(() => {
										onPress?.();
									}, 280);
								}}
							>
								<Typography type="inherit">{name}</Typography>
							</Pressable>
						))}
					</View>
					{renderNativeFooter && (
						<>
							<Divider />
							{renderNativeFooter}
						</>
					)}
				</>
			)}
		</Sheet>
	);
};

export default Dropdown;
