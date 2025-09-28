import { router, useLocalSearchParams } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { Button, Divider, Switch, Typography } from "#/components";

interface HeaderWithIconProps {
	title: string;
	icon?: LucideIcon | React.ReactNode;
	filters?: (
		| { key: string; items: { name: string; value: string }[]; type: "switch" }
		| { key: string; text: string; type: "selectList" }
	)[];
	info?: { name: string; value?: string | null }[];
}

const HeaderWithIcon: React.FC<HeaderWithIconProps> = ({
	title,
	filters,
	info,
	icon: Icon,
}) => {
	const searchParams = useLocalSearchParams();

	return (
		<View className="gap-6">
			{Icon && (
				<View className="justify-center items-center bg-gray-100 rounded-full w-20 h-20">
					{React.isValidElement(Icon) ? (
						Icon
					) : (
						// @ts-ignore: React issue with typeof Comp
						<Icon size={24} className="text-gray-500" />
					)}
				</View>
			)}
			<Typography size="large4.5">{title}</Typography>
			{filters && (
				<View className="flex-row items-center gap-4">
					{filters.map((filter, index) => (
						<React.Fragment key={filter.key}>
							{filter.type === "switch" && (
								<Switch
									items={filter.items}
									value={(searchParams[filter.key] ?? "").toString()}
									onChange={(value) =>
										router.setParams({
											[filter.key]: value ? value : undefined,
										})
									}
								/>
							)}
							{filters.length >= 2 && index === 1 && (
								<Divider orientation="vertical" className="h-8" />
							)}
							{filter.type === "selectList" && (
								<Button
									variant="outlined"
									text={filter.text}
									className="!h-11"
									rounded
								/>
							)}
						</React.Fragment>
					))}
				</View>
			)}
			{info && (
				<View className="flex-row gap-8">
					{info.map(({ name, value }) => (
						<View key={name} className="gap-y-1">
							<Typography type="washed">{name}</Typography>
							<Typography size="base">{value ?? "Brak informacji"}</Typography>
						</View>
					))}
				</View>
			)}
		</View>
	);
};

export default HeaderWithIcon;
