import { Link, usePathname } from "expo-router";
import type React from "react";
import { useCallback } from "react";
import { View } from "react-native";
import { Typography } from "#/components";

interface TabsProps {
	items: { name: string; href: string }[];
	className?: string;
}

const Tabs: React.FC<TabsProps> = ({ items, className = "", ...props }) => {
	const pathname = usePathname();

	const isActive = useCallback((path: string) => pathname === path, [pathname]);

	return (
		<View className={`flex-row gap-8 ${className}`} {...props}>
			{items.map(({ name, href }) => {
				const active = isActive(href);

				return (
					<Link
						key={href}
						href={href}
						className={`py-2 leading-5 ${active ? "border-b-2" : ""}`}
					>
						<Typography type={active ? "dark" : "washed"}>{name}</Typography>
					</Link>
				);
			})}
		</View>
	);
};

export default Tabs;
