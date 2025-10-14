import {
	Menu as HeadlessMenu,
	MenuButton as HeadlessMenuButton,
	MenuItem as HeadlessMenuItem,
	MenuItems as HeadlessMenuItems,
} from "@headlessui/react";
import { View, Image } from "react-native";
import { Divider, Typography } from "#/components";
import type { DropdownProps } from "#/components/dropdown/types";

const Dropdown: React.FC<DropdownProps> = ({
	trigger,
	items,
	className = "",
	renderWebHeader,
	renderWebFooter,
	webOptions,
}) => {
	return (
		<HeadlessMenu {...webOptions}>
			{({ close }) => (
				<>
					<HeadlessMenuButton>{trigger}</HeadlessMenuButton>
					<HeadlessMenuItems
						anchor="bottom end"
						className={`flex flex-col bg-[#414141] data-closed:opacity-0 border border-white/5 rounded-2xl focus:outline-none w-56 data-closed:scale-95 origin-top-right transition duration-100 ease-out ${className}`}
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
							{items.map(({ name, disabled, imageUrl, className, onPress }) => (
								<HeadlessMenuItem key={name}>
									<button
										type="button"
										className={`py-3 px-3 text-left rounded-lg data-[focus]:bg-[#ededed14] ${className} ${disabled ? "opacity-60 pointer-events-none" : ""}`}
										onClick={() => {
											onPress?.();
											close();
										}}
									>
										<View className="flex-row w-full items-center flex-1">
											<Typography
												type="bright"
												size="raw"
												className="text-[14px]"
											>
												{name}
											</Typography>
											{imageUrl && <Image source={{ uri: imageUrl }} style={{ width: 20, height: 14 }} className="ms-auto"/>}
										</View>
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
