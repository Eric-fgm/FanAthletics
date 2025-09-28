import { useGlobalSearchParams } from "expo-router";
import React from "react";
import { Tabs } from "#/components";

const EventNavigation = () => {
	const { eventId } = useGlobalSearchParams();

	const items = [
		{ name: "Aktualności", href: `/events/${eventId}` },
		{
			name: "Tabela wyników",
			href: `/events/${eventId}/leaderboard`,
			exact: false,
		},
		{
			name: "Dyscypliny",
			href: `/events/${eventId}/disciplines`,
			exact: false,
		},
		{ name: "Zawodnicy", href: `/events/${eventId}/athletes`, exact: false },
	];

	return <Tabs items={items} className="px-4 md:px-8 xl:px-24" />;
};

export default EventNavigation;
