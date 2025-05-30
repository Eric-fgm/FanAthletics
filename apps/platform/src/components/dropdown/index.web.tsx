import {
	Menu as HeadlessMenu,
	MenuButton as HeadlessMenuButton,
	MenuItem as HeadlessMenuItem,
	MenuItems as HeadlessMenuItems,
} from "@headlessui/react";
import { View } from "react-native";
import { Divider, Typography } from "#/components";
import type { DropdownProps } from "#/components/dropdown/types";

const Dropdown: React.FC<DropdownProps> = ({
	trigger,
	items,
	renderWebHeader,
	renderWebFooter,
}) => {
	return (
		<HeadlessMenu>
			<HeadlessMenuButton>{trigger}</HeadlessMenuButton>
			<HeadlessMenuItems
				anchor="bottom end"
				className="mt-4 w-56 flex flex-col origin-top-right rounded-2xl border border-white/5 bg-[#414141] transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
			>
				{renderWebHeader && (
					<>
						{renderWebHeader}
						<Divider color="dark" />
					</>
				)}
				<View className="p-2">
					{items.map(({ name, className, onPress }) => (
						<HeadlessMenuItem key={name}>
							<button
								type="button"
								className={`py-1.5 px-3 text-left rounded-lg data-[focus]:bg-[#ededed14] ${className}`}
								onClick={onPress}
							>
								<Typography type="bright">{name}</Typography>
							</button>
						</HeadlessMenuItem>
					))}
				</View>
				{renderWebFooter && (
					<>
						<Divider color="dark" />
						{renderWebFooter}
					</>
				)}
			</HeadlessMenuItems>
		</HeadlessMenu>
	);
};

export default Dropdown;
