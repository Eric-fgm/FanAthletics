import type { CompetitionWithCompetitors } from "@fan-athletics/shared/types";
import type React from "react";
import { ScrollView } from "react-native";
import CompetitionCard from "./competition-card";

interface CompetitionListProps {
	competitions: CompetitionWithCompetitors[];
	className?: string;
}

const CompetitionList: React.FC<CompetitionListProps> = ({
	competitions,
	className = "",
}) => {
	return (
		<ScrollView
			contentContainerClassName={`flex-row gap-4 ${className}`}
			showsHorizontalScrollIndicator={false}
			horizontal
		>
			{competitions.map(({ id, discipline, competitors, startAt }) => (
				<CompetitionCard
					key={id}
					title={discipline.name}
					competitors={competitors}
					startAt={startAt}
				/>
			))}
		</ScrollView>
	);
};

export default CompetitionList;
