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

	const eventDate = eventDateInfo(event.startAt, event.endAt);

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

const months: Record<string, string> = {
	"01": "stycznia",
	"02": "lutego",
	"03": "marca",
	"04": "kwietnia",
	"05": "maja",
	"06": "czerwca",
	"07": "lipca",
	"08": "sierpnia",
	"09": "września",
	"10": "października",
	"11": "listopada",
	"12": "grudnia",
};

function eventDateInfo(startDate: string, endDate: string) {
	function writeFullDate(date: string, withoutYear = false, withoutMonthAndYear = false) {
		if (withoutYear)
			return `${date.substring(8, 10)} ${months[date.substring(5, 7)]}`;
		if (withoutMonthAndYear)
			return date.substring(8, 10);
		return `${date.substring(8, 10)} ${months[date.substring(5, 7)]} ${date.substring(0, 4)}`;
	}

	if (startDate === endDate)
		return writeFullDate(startDate);

	if (startDate.substring(0, 4) !== endDate.substring(0, 4))
		return `${writeFullDate(startDate)} - ${writeFullDate(endDate)}`;
	if (startDate.substring(5, 7) !== endDate.substring(5, 7))
		return `${writeFullDate(startDate, true)} - ${writeFullDate(endDate)}`;
	return `${writeFullDate(startDate, false, true)} - ${writeFullDate(endDate)}`;
}