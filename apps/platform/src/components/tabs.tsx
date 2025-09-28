import { Link, usePathname } from "expo-router";
import type React from "react";
import { useCallback } from "react";
import { View } from "react-native";
import { Typography } from "#/components";

interface TabsProps {
	items: { name: string; href: string; exact?: boolean }[];
	exact?: boolean;
	className?: string;
}

const Tabs: React.FC<TabsProps> = ({
	items,
	exact = true,
	className = "",
	...props
}) => {
	const pathname = usePathname();

	const isActive = useCallback(
		(path: string, localExact?: boolean) => {
			const isExact = localExact !== undefined ? localExact : exact;
			return isExact ? pathname === path : pathname.startsWith(path);
		},
		[pathname, exact],
	);

	return (
		<View className={`flex-row gap-8 ${className}`} {...props}>
			{items.map(({ name, href, exact }) => {
				const active = isActive(href, exact);

				return (
					<Link
						key={href}
						href={href}
						className={`py-3 leading-5 ${active ? "border-b-2" : ""}`}
					>
						<Typography type={active ? "dark" : "washed"}>{name}</Typography>
					</Link>
				);
			})}
		</View>
	);
};

export default Tabs;
