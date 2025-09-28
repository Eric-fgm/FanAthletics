import { ChevronRight } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Typography from "./typography";

const Breadcrumbs: React.FC<{ items: { name: string; href: string }[] }> = ({
	items,
}) => {
	return (
		<View className="flex-row items-center gap-1">
			{items.map((item, index) => (
				<React.Fragment key={item.href}>
					<Typography className="max-w-32" numberOfLines={1}>
						{item.name}
					</Typography>
					{index !== items.length - 1 && <ChevronRight size={16} />}
				</React.Fragment>
			))}
		</View>
	);
};

export default Breadcrumbs;
