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
		<ScrollView className="pt-16 pb-8 px-4 md:px-8 xl:px-24">
			<View className="items-center">
				<Typography size="large5">Wydarzenia</Typography>
				<Typography type="washed" className="mt-4 text-center">
					Bądź na bieżąco z najważniejszymi momentami.
				</Typography>
				<View className="mt-8 flex-row items-center gap-4">
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
			<View className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 w-full gap-4">
				{events?.map((event) => (
					<EventItem key={event.id} {...event} />
				))}
			</View>
		</ScrollView>
	);
}
