import { DisciplineList, useEventDiscpilinesQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventDisciplines() {
	const { data: disciplines = [] } = useEventDiscpilinesQuery();

	return (
		<ScrollArea className="gap-8">
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
			<DisciplineList disciplines={disciplines} />
		</ScrollArea>
	);
}
