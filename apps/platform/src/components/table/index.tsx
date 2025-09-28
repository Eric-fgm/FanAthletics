import React from "react";
import { View } from "react-native";
import { Typography } from "#/components";

type Row = { id: string } & {};

interface TableProps<T extends Row> {
	columns: {
		key: string;
		render?: (row: T) => React.ReactNode;
	}[];
	data: T[];
	placeholder?: React.ReactNode;
	className?: string;
}

const Table = <T extends Row>({
	columns,
	data,
	placeholder,
	className = "",
}: TableProps<T>) => {
	return (
		<View
			className={`border border-gray-200 rounded-2xl ${className}`}
			// style={{
			// 	backgroundColor: "white",
			// 	shadowColor: "#000",
			// 	shadowOpacity: 0.08,
			// 	shadowOffset: { width: 0, height: 8 },
			// 	shadowRadius: 16,
			// }}
		>
			{placeholder ? (
				placeholder
			) : !data.length ? (
				<View className="items-center gap-1 py-16">
					<Typography className="text-xl">Nie znaleziono danych</Typography>
					<Typography type="washed">
						Try searching for something else
					</Typography>
				</View>
			) : (
				data.map((row, index) => (
					<React.Fragment key={row.id}>
						<View className="flex-row items-center px-5 h-[86px]">
							{columns.map((column) => (
								<React.Fragment key={column.key}>
									{column.render?.(row)}
								</React.Fragment>
							))}
						</View>
						{index !== data.length - 1 && (
							<View className="bg-gray-200 w-full h-px" />
						)}
					</React.Fragment>
				))
			)}
		</View>
	);
};

export default Table;
