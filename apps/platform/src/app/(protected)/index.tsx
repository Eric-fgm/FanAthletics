import { ScrollView, View } from "react-native";
import { Button, Divider, Switch, Typography } from "#/components";
import { useSessionSuspeneQuery } from "#/features/auth";
import {
	EventCreateDialog,
	EventItem,
	useEventsQuery,
} from "#/features/events";
import { isAdmin } from "#/helpers/user";

export default function Events() {
	const { data: session } = useSessionSuspeneQuery();
	const { data: events } = useEventsQuery();

	return (
		<ScrollView className="px-4 md:px-8 xl:px-24 pt-16 pb-8">
			<View className="items-center">
				<Typography size="large5">Wydarzenia</Typography>
				<Typography type="washed" className="mt-4 text-center">
					Bądź na bieżąco z najważniejszymi momentami.
				</Typography>
				<View className="flex-row items-center gap-4 mt-8">
					<Switch
						items={[
							{ name: "Wszystkie", value: "all" },
							{ name: "Dostępne", value: "available" },
						]}
						value="all"
					/>
					{session && isAdmin(session.user) && (
						<>
							<Divider orientation="vertical" className="h-8" />
							<EventCreateDialog
								trigger={<Button text="Dodaj" className="!h-11" rounded />}
							/>
						</>
					)}
				</View>
			</View>
			<View className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-16 w-full">
				{events?.map((event) => (
					<EventItem key={event.id} {...event} />
				))}
			</View>
		</ScrollView>
	);
}
