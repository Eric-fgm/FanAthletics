import React from "react";
import { View } from "react-native";
import { Typography } from "#/components";

type Row = { id: string } & {};

interface TableProps<T extends Row> {
	columns: {
		key: string;
		name: string | React.ReactNode;
		render?: (row: T) => React.ReactNode;
	}[];
	data: T[];
}

const Table = <T extends Row>({ columns, data }: TableProps<T>) => {
	return (
		<View>
			<View className="flex-row items-center border-gray-200 border-b h-10">
				{columns.map(({ key, name }) =>
					typeof name === "string" ? (
						<View key={key}>
							<Typography size="small" type="washed">
								{name}
							</Typography>
						</View>
					) : (
						name
					),
				)}
			</View>
			{data.map((row) => (
				<View
					key={row.id}
					className="flex-row items-center border-gray-200 border-b h-[72px]"
				>
					{Object.keys(row).map((key) => (
						<React.Fragment key={key}>
							{columns.find((column) => column.key === key)?.render?.(row)}
						</React.Fragment>
					))}
					{columns.find((column) => column.key === "action")?.render?.(row)}
				</View>
			))}
		</View>
	);
};

export default Table;
