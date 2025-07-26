import { CompetitionList, useEventCompetitionsQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function SingleEvent() {
	const { data: competitions = [] } = useEventCompetitionsQuery();

	return (
		<ScrollArea>
			<Header
				title="Dyscypliny"
				filters={[
					{
						key: "available",
						items: [
							{ name: "Wszystkie", value: "" },
							{ name: "Dostępne", value: "date" },
						],
						type: "switch",
					},
					{ key: "team", text: "Drużyna", type: "selectList" },
					{ key: "order", text: "Najnowsze", type: "selectList" },
				]}
			/>
			<CompetitionList competitions={competitions} className="py-8" />
		</ScrollArea>
	);
}
