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
	className = "",
	renderWebHeader,
	renderWebFooter,
}) => {
	return (
		<HeadlessMenu>
			{({ close }) => (
				<>
					<HeadlessMenuButton>{trigger}</HeadlessMenuButton>
					<HeadlessMenuItems
						anchor="bottom end"
						className={`flex flex-col bg-[#414141] data-closed:opacity-0 data-[anchor="top_end"]:-mt-4 data-[anchor="bottom_end"]:mt-4 border border-white/5 rounded-2xl focus:outline-none w-56 data-closed:scale-95 origin-top-right transition duration-100 ease-out ${className}`}
					>
						{renderWebHeader && (
							<>
								{typeof renderWebHeader === "function"
									? renderWebHeader({ close })
									: renderWebHeader}
								<Divider color="dark" />
							</>
						)}
						<View className="p-2">
							{items.map(({ name, disabled, className, onPress }) => (
								<HeadlessMenuItem key={name}>
									<button
										type="button"
										className={`py-1.5 px-3 text-left rounded-lg data-[focus]:bg-[#ededed14] ${className} ${disabled ? "opacity-60 pointer-events-none" : ""}`}
										onClick={() => {
											onPress?.();
											close();
										}}
									>
										<Typography
											type="bright"
											size="raw"
											className="text-[14px]"
										>
											{name}
										</Typography>
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
				</>
			)}
		</HeadlessMenu>
	);
};

export default Dropdown;
