import type { Event } from "@fan-athletics/shared/types";
import { Image, View } from "react-native";
import { Button, Typography } from "#/components";
import { useEventDeletedMutation } from "../services";

interface EventItemProps extends Event {}

const EventItem: React.FC<EventItemProps> = ({
	id,
	name,
	organization,
	image,
	icon,
}) => {
	const { mutateAsync: deleteEvent, isPending } = useEventDeletedMutation();
	return (
		<View className="aspect-[4/3] grid place-items-center grid-rows-1 rounded-3xl overflow-hidden bg-gray-100">
			<Image
				style={{ width: "100%", height: "100%" }}
				source={{ uri: image }}
				className="absolute brightness-[.625]"
			/>
			<Typography
				size="small"
				type="bright"
				className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#ffffff49]"
			>
				W trakcie
			</Typography>
			<View className="items-center">
				<Image
					source={{ uri: icon, height: 48, width: 48 }}
					className="rounded-xl"
				/>
				<Typography type="bright" className="mt-4 mb-1 text-[20px]">
					{name}
				</Typography>
				<Typography size="normal" type="washed-bright">
					{organization}
				</Typography>
				<Button
					href={`/events/${id}`}
					text="Weź udział"
					size="small"
					variant="white"
					className="mt-8"
					rounded
				/>
				<Button
					text="Usuń"
					size="small"
					variant="primary"
					className="mt-8"
					rounded
					onPress={() => deleteEvent(id)}
				/>
			</View>
		</View>
	);
};

export default EventItem;
