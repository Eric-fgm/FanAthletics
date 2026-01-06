import type { Event } from "@fan-athletics/shared/types";
import { Trophy } from "lucide-react-native";
import type React from "react";
import { Image, ImageBackground, View } from "react-native";
import Typography from "./typography";

const EventHeader: React.FC<{
	event: Event | undefined;
}> = ({ event }) => {
	console.log(event);

	if (event === undefined) return null;

	const eventDate = eventDateInfo(
		new Date(event.startAt),
		new Date(event.endAt),
	);

	return (
		<View className="p-7 mb-3">
			<ImageBackground
				source={{ uri: event.image }}
				imageStyle={{ borderRadius: 16 }}
				className="p-5 w-full h-full items-center"
			>
				<View
					style={{
						position: "absolute",
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						borderRadius: 16,
					}}
				/>
				<View className="flex-row w-full justify-between">
					<View className="flex-row h-full items-center gap-4 flex-1">
						<View
							className="items-center justify-center w-[100] h-[100] hidden sm:flex"
							style={{ backgroundColor: "white", borderRadius: 8 }}
						>
							{event.icon ? (
								<Image
									source={{ uri: event.icon }}
									style={{ width: "75%", height: "75%" }}
								/>
							) : (
								<Trophy size="75%" />
							)}
						</View>
						<Typography size="large5" type="bright" className="shrink">
							{event.name}
						</Typography>
					</View>
					<View className="mt-auto hidden lg:flex">
						<Typography size="large2" type="bright">
							{eventDate}
						</Typography>
					</View>
				</View>
				<View className="w-full">
					<Typography
						size="large2"
						type="bright"
						className="ms-auto hidden max-lg:flex mt-3"
					>
						{eventDate}
					</Typography>
				</View>
			</ImageBackground>
		</View>
	);
};

export default EventHeader;

const months: Record<number, string> = {
	1: "stycznia",
	2: "lutego",
	3: "marca",
	4: "kwietnia",
	5: "maja",
	6: "czerwca",
	7: "lipca",
	8: "sierpnia",
	9: "września",
	10: "października",
	11: "listopada",
	12: "grudnia",
};

function eventDateInfo(startDate: Date, endDate: Date) {
	function writeFullDate(
		date: Date,
		withoutYear = false,
		withoutMonthAndYear = false,
	) {
		if (withoutYear)
			return `${date.getUTCDate()} ${months[date.getUTCMonth() + 1]}`;
		if (withoutMonthAndYear) return date.getUTCDate();
		return `${date.getUTCDate()} ${months[date.getUTCMonth() + 1]} ${date.getUTCFullYear()}`;
	}

	if (startDate.getDate() === endDate.getDate())
		return writeFullDate(startDate);

	if (startDate.getUTCFullYear() !== endDate.getUTCFullYear())
		return `${writeFullDate(startDate)} - ${writeFullDate(endDate)}`;
	if (startDate.getUTCMonth() !== endDate.getUTCMonth())
		return `${writeFullDate(startDate, true)} - ${writeFullDate(endDate)}`;
	return `${writeFullDate(startDate, false, true)} - ${writeFullDate(endDate)}`;
}
