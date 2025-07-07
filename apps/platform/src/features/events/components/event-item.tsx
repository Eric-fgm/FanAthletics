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
	const { mutate: deleteEvent } = useEventDeletedMutation();
	return (
		<View className="place-items-center grid grid-rows-1 bg-gray-100 rounded-3xl aspect-[4/3] overflow-hidden">
			<Image
				style={{ width: "100%", height: "100%" }}
				source={{ uri: image }}
				className="absolute brightness-[.625]"
			/>
			<Typography
				size="small"
				type="bright"
				className="top-4 left-4 absolute bg-[#ffffff49] px-3 py-1 rounded-full"
			>
				W trakcie
			</Typography>
			<View className="items-center">
				<Image
					source={{ uri: icon, height: 48, width: 48 }}
					className="rounded-xl"
				/>
				<Typography type="bright" size="large" className="mt-4 mb-1">
					{name}
				</Typography>
				<Typography size="normal" type="washed-bright">
					{organization}
				</Typography>
				<View className="flex-row items-center gap-2 mt-8">
					<Button
						href={`/events/${id}`}
						text="Weź udział"
						size="small"
						variant="white"
						rounded
					/>
					<Button
						text="Usuń"
						size="small"
						rounded
						onPress={() => deleteEvent(id)}
					/>
				</View>
			</View>
		</View>
	);
};

export default EventItem;
