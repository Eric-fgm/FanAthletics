import { router, useLocalSearchParams } from "expo-router";
import type React from "react";
import { View } from "react-native";
import { Button, Switch, Typography } from "#/components";

interface HeaderProps {
	title: string;
	filters?: (
		| { key: string; items: { name: string; value: string }[]; type: "switch" }
		| { key: string; text: string; type: "selectList" }
	)[];
	titleClassName?: string;
	filtersClassName?: string;
}

const Header: React.FC<HeaderProps> = ({
	title,
	filters = [],
	titleClassName,
	filtersClassName,
}) => {
	const searchParams = useLocalSearchParams();

	const switchFilters = filters.filter((filter) => filter.type === "switch");
	const selectListFilters = filters.filter(
		(filter) => filter.type === "selectList",
	);

	return (
		<View>
			<View
				className={`gap-4 px-4 lg:px-12 pb-8 border-[#eeeff1] border-b ${titleClassName}`}
			>
				<Typography size="large6">{title}</Typography>
			</View>
			{!!switchFilters.length && (
				<View
					className={`px-4 lg:px-12 py-6 border-[#eeeff1] border-b ${filtersClassName}`}
				>
					{switchFilters.map((filter) => (
						<Switch
							key={filter.key}
							items={filter.items}
							value={(searchParams[filter.key] ?? "").toString()}
							onChange={(value) =>
								router.setParams({
									[filter.key]: value ? value : undefined,
								})
							}
						/>
					))}
				</View>
			)}
			{!!selectListFilters.length && (
				<View className="flex-row gap-x-2 px-4 lg:px-12 py-6">
					{selectListFilters.map((filter) => (
						<Button
							key={filter.key}
							variant="outlined"
							size="small"
							text={filter.text}
							textClassName="!text-sm"
							rounded
						/>
					))}
				</View>
			)}
		</View>
	);
};

export default Header;
