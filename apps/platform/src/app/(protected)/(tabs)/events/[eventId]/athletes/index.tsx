import { AthleteList, useEventAthletesQuery } from "#/features/events";
import { Header, ScrollArea } from "#/features/layout";

export default function EventAthletes() {
	const { data: athletes = [] } = useEventAthletesQuery();

	return (
		<ScrollArea className="gap-8">
			<Header
				title="Zawodnicy"
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
			<AthleteList athletes={athletes} />
		</ScrollArea>
	);
}
