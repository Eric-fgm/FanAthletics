import type { Competitor } from "@fan-athletics/shared/types";
import { User } from "lucide-react-native";
import type React from "react";
import { Image, View } from "react-native";
import { Typography } from "#/components";

interface CompetitionCardProps {
	title: string;
	competitors: Competitor[];
	startAt: Date;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({
	title,
	competitors,
	startAt,
}) => {
	const orderedCompetitors = competitors.sort((a, b) => a.place - b.place);

	return (
		<View className="gap-y-5 px-4 py-5 border border-gray-200 rounded-2xl w-80">
			<View className="flex-row justify-between items-start">
				<View className="gap-1">
					<View className="flex-row items-center gap-2">
						<View className="bg-gray-100 rounded-full w-2 h-2" />
						<Typography>{title}</Typography>
					</View>
					<Typography size="small" type="washed" className="pl-4">
						W trakcie
					</Typography>
				</View>
				<View className="bg-gray-100 px-2 py-1 rounded-full">
					<Typography size="small" type="washed">
						{startAt &&
							new Date(startAt).toLocaleDateString("en-GB", {
								day: "2-digit",
								month: "long",
								year: "numeric",
							})}
					</Typography>
				</View>
			</View>
			<View className="gap-y-4">
				{orderedCompetitors
					.slice(0, 3)
					.map(({ id, firstName, lastName, imageUrl, results }) => (
						<View key={id} className="flex-row justify-between items-center">
							<View className="flex-row items-center gap-2">
								{imageUrl ? (
									<Image source={{ uri: imageUrl }} />
								) : (
									<View className="justify-center items-center bg-gray-100 rounded-full w-6 h-6">
										<User size={16} className="text-gray-500" />
									</View>
								)}
								<Typography>
									{firstName} {lastName}
								</Typography>
							</View>
							<View>
								<Typography size="small">{results.score}</Typography>
							</View>
						</View>
					))}
			</View>
		</View>
	);
};

export default CompetitionCard;
