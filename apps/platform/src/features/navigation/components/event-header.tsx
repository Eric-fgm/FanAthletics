import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Tabs } from "#/components";

const EventHeader = () => {
	const { eventId } = useLocalSearchParams();

	const items = [
		{ name: "Aktualności", href: `/events/${eventId}` },
		{ name: "Tabela wyników", href: `/events/${eventId}/leaderboard` },
		{ name: "Dyscypliny", href: `/events/${eventId}/disciplines` },
		{ name: "Zawodnicy", href: `/events/${eventId}/athletes` },
	];

	return <Tabs items={items} className="px-4 md:px-8 xl:px-24" />;
};

export default EventHeader;
