import type { CompetitionWithCompetitors } from "@fan-athletics/shared/types";
import { Link } from "expo-router";
import { CircleUser } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { Switch, Typography } from "#/components";
import { useEventQuery } from "#/features/events";
import { GradientBox, GradientType, getFlagUrl } from "../participation/utils";

export const Timetable: React.FC<{
	competitions: CompetitionWithCompetitors[];
}> = ({ competitions }) => {
	const [selectedCompetition, setSelectedCompetition] =
		useState<CompetitionWithCompetitors | null>(null);

	competitions = competitions.map((c) => {
		return {
			...c,
			startAt: new Date(c.startAt),
		};
	});

	const days = [
		...new Set(
			competitions.map((c) => c.startAt.toISOString().substring(0, 10)),
		),
	].sort((a, b) => {
		if (a < b) return -1;
		return 1;
	});

	const [currentDay, setCurrentDay] = useState<string>(days[0]);
	console.log(
		"Comp: ",
		competitions[0],
		typeof competitions[0],
		competitions.length,
	);

	return (
		<View className="md:flex-row py-3 px-5">
			<View className="w-full md:w-[20%] mb-3">
				<Switch
					items={days.map((day, index) => {
						return {
							name: `Dzień ${index + 1}`,
							value: day,
						};
					})}
					value={currentDay}
					onChange={(value) => {
						console.log(value);
						setCurrentDay(value);
					}}
					className="w-full justify-between mb-3"
					itemsWidthEqual={true}
				/>
				<CompetitionsList
					competitions={competitions.filter(
						(c) => c.startAt.toISOString().substring(0, 10) === currentDay,
					)}
					onCompetitionSelect={setSelectedCompetition}
					selectedCompetition={selectedCompetition}
				/>
			</View>
			{selectedCompetition && (
				<View className="w-full md:w-[80%]">
					<ResultsTable competition={selectedCompetition} />
				</View>
			)}
		</View>
	);
};

const CompetitionsList: React.FC<{
	competitions: CompetitionWithCompetitors[];
	onCompetitionSelect: (competition: CompetitionWithCompetitors) => void;
	selectedCompetition: CompetitionWithCompetitors | null;
}> = ({ competitions, onCompetitionSelect, selectedCompetition }) => {
	const [selectedCompetitionBar, setSelectedCompetitionBar] = useState<
		string | null
	>(null);
	console.log(competitions);

	const competitionsConsolidated: Map<string, CompetitionWithCompetitors[]> =
		new Map();
	competitions.map((c) => {
		const key = `${c.disciplineId}-${c.round}-${c.startAt.toISOString().substring(11, 16)}`;
		if (competitionsConsolidated.has(key)) {
			competitionsConsolidated.set(
				key,
				(competitionsConsolidated.get(key) ?? []).concat(c),
			);
		} else {
			competitionsConsolidated.set(key, [c]);
		}
	});
	console.log(competitionsConsolidated);

	return (
		<ScrollView className="w-full h-[524px]">
			<View className="gap-y-1">
				{Array.from(competitionsConsolidated)
					.map(([key, competitions]) => {
						return { key: key, competitions: competitions };
					})
					.sort((a, b) => {
						if (
							a.competitions[0].startAt.toISOString() <
							b.competitions[0].startAt.toISOString()
						)
							return -1;
						return 1;
					})
					.map((compCons) => (
						<CompetitionBar
							key={compCons.key}
							competitions={compCons.competitions}
							onPress={() => {
								if (compCons.competitions.length === 1)
									onCompetitionSelect(compCons.competitions[0]);
								if (selectedCompetitionBar !== compCons.key)
									setSelectedCompetitionBar(compCons.key);
								else setSelectedCompetitionBar(null);
							}}
							onCompetitionSelect={onCompetitionSelect}
							currentlySelectedBar={selectedCompetitionBar}
							currentlySelectedCompetition={selectedCompetition}
						/>
					))}
			</View>
		</ScrollView>
	);
};

const CompetitionBar: React.FC<{
	competitions: CompetitionWithCompetitors[];
	onPress: () => void;
	onCompetitionSelect: (competition: CompetitionWithCompetitors) => void;
	currentlySelectedBar: string | null;
	currentlySelectedCompetition: CompetitionWithCompetitors | null;
}> = ({
	competitions,
	onPress,
	onCompetitionSelect,
	currentlySelectedBar,
	currentlySelectedCompetition,
}) => {
	const hour = new Date(competitions[0].startAt).toLocaleTimeString("pl-PL", {
		hour: "2-digit",
		minute: "2-digit",
	});
	const key = `${competitions[0].disciplineId}-${competitions[0].round}-${competitions[0].startAt.toISOString().substring(11, 16)}`;
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const colors = {
		normal: "#973232",
		hover: "#FF5100",
	};
	const isSelected = currentlySelectedBar === key;
	const barInfoColor = isSelected || isHovered ? colors.hover : colors.normal;
	const competitionSex = getCompetitionSexOrName(competitions[0]);

	return (
		<View>
			<Pressable
				onPress={onPress}
				onHoverIn={() => setIsHovered(true)}
				onHoverOut={() => setIsHovered(false)}
			>
				<View
					className="flex-row w-full rounded-xl justify-center bg-[#EFEFEF] border"
					style={{ borderColor: barInfoColor }}
				>
					<View className="flex-row md:flex-col max-md:w-[40%] ps-2 my-1 max-md:items-center">
						<View>
							<Typography size="base">{hour}</Typography>
						</View>

						<Typography size="small" className="ms-auto me-2">
							{competitionSex}
						</Typography>
					</View>

					<View
						className="px-3 ms-auto py-1 w-[70%] max-md:w-[60%] rounded-xl flex-row md:flex-col max-md:items-center"
						style={{ backgroundColor: barInfoColor }}
					>
						<Typography
							type="bright"
							className="max-md:me-auto md:ms-auto mb-1"
						>
							{getCompetitionSexOrName(competitions[0], false)}
						</Typography>
						<View
							className="ms-auto px-2 rounded-md bg-red-400 items-center justify-center"
							style={{
								backgroundColor: competitions[0].round === 3 ? "red" : "",
							}}
						>
							<Typography size="small" type="bright">
								{roundLabels[competitions[0].round].long}
							</Typography>
						</View>
					</View>
				</View>
			</Pressable>
			{currentlySelectedBar === key && competitions.length > 1 && (
				<View
					className={`py-2 gap-y-1 gap-x-1 grid grid-cols-${competitions.length > 3 ? "3" : competitions.length}`}
				>
					{competitions
						.sort((a, b) => {
							if (a.series < b.series) return -1;
							return 1;
						})
						.map(
							(c) =>
								c.competitors.length > 0 && ( //Trzeba na backendzie zrobić jakieś poprawki, bo finały A się kilka razy pobierają
									<Pressable onPress={() => onCompetitionSelect(c)}>
										<View
											className="px-2 py-1 border rounded-lg"
											style={{
												backgroundColor:
													currentlySelectedCompetition &&
													currentlySelectedCompetition.id === c.id
														? "#9f9f9fff"
														: "#EFEFEF",
											}}
										>
											<Typography>{convertSeriesName(c.note)}</Typography>
										</View>
									</Pressable>
								),
						)}
				</View>
			)}
		</View>
	);
};

const ResultsTable: React.FC<{
	competition: CompetitionWithCompetitors;
}> = ({ competition }) => {
	const { data: event } = useEventQuery();
	if (!event) return null;

	const columnClass = {
		place: "w-[15%] md:w-[10%]",
		lane: "hidden lg:flex w-[3%]",
		number: "hidden md:flex md:w-[7%] lg:w-[5%]",
		athlete: "w-[35%] md:w-[25%]",
		club: "w-[30%] md:w-[25%]",
		nationality: "hidden md:flex w-[15%]",
		result: "w-[20%] md:w-[10%]",
	};

	// const columns = useMemo(() => {
	// 	return [
	// 		{
	// 			key=""
	// 		}
	// 	]
	// })

	return (
		// Pasowałoby to przerobić na tabelkę
		<View className="w-full ms-5">
			<Typography size="large4" className="mb-3">
				{competition.discipline.name} -{" "}
				{convertSeriesName(competition.note, competition.round)}
			</Typography>
			<GradientBox sex="K" gradientType={GradientType.CAPTAIN} horizontal>
				<View className="flex-row gap-x-4 my-2 mx-3">
					<Typography size="base" type="bright" className={columnClass.place}>
						Miejsce
					</Typography>
					<Typography size="base" type="bright" className={columnClass.lane}>
						Tor
					</Typography>
					<Typography size="base" type="bright" className={columnClass.number}>
						Numer
					</Typography>
					<Typography size="base" type="bright" className={columnClass.athlete}>
						Zawodnik
					</Typography>
					<Typography size="base" type="bright" className={columnClass.club}>
						Klub
					</Typography>
					<Typography
						size="base"
						type="bright"
						className={columnClass.nationality}
					>
						Narodowość
					</Typography>
					<Typography size="base" type="bright" className={columnClass.result}>
						{competition.competitors[0]?.results ? "Wynik" : "TOP3 %"}
					</Typography>
				</View>
			</GradientBox>
			<View className="mt-3">
				{competition.competitors
					.sort((a, b) => {
						if (a.results && b.results)
							return a.results.place - b.results.place;
						return a.lane - b.lane;
					})
					.map((competitor, index) => (
						<View
							key={`${competitor.id}-${competition.id}`}
							className="flex-row gap-x-4 py-2 px-3 items-center"
							style={{ backgroundColor: index % 2 === 0 ? "white" : "#EFEFEF" }}
						>
							<Typography className={columnClass.place}>
								{competitor.results &&
									competitor.results.place !== 9999 &&
									competitor.results.place}
							</Typography>
							<Typography className={columnClass.lane}>
								{competitor.lane}
							</Typography>
							<Typography className={columnClass.number}>
								{competitor.number}
							</Typography>
							<Link
								href={`/events/${event.id}/athletes/${competitor.id}`}
								className={columnClass.athlete}
							>
								<View className="flex-row items-center gap-x-2">
									{competitor.imageUrl ? (
										<Image
											source={{ uri: competitor.imageUrl }}
											style={{ width: 32, height: 32, borderRadius: 16 }}
										/>
									) : (
										<CircleUser size={32} />
									)}
									<Typography>
										{competitor.firstName} {competitor.lastName}
									</Typography>
								</View>
							</Link>
							<Typography className={columnClass.club}>
								{competitor.club}
							</Typography>
							<View className={columnClass.nationality}>
								<Image
									source={{ uri: getFlagUrl(competitor.nationality) }}
									style={{ width: 32, height: 24 }}
								/>
							</View>
							<Typography className={columnClass.result}>
								{competitor.results !== null
									? competitor.results?.result
									: `${Math.round(competitor.winPrediction * 100)}%`}
							</Typography>
						</View>
					))}
			</View>
		</View>
	);
};

function convertSeriesName(
	seriesName: string | null,
	round: number | null = null,
) {
	console.log(seriesName, round, round && roundLabels[round]);
	if (!seriesName || seriesName.startsWith("FINAŁ")) return "Finał";
	if (seriesName.startsWith("Finał")) return seriesName;
	return `${round ? `${roundLabels[round].long} s` : "S"}eria ${seriesName.substring(seriesName.lastIndexOf(" ") + 1)}`;
}

function getCompetitionSexOrName(
	competition: CompetitionWithCompetitors,
	sex = true,
) {
	const name = competition.discipline.name;
	if (sex) {
		if (name[0] === "M" || name[0] === "K")
			return name[0] === "M" ? "Mężczyźni" : "Kobiety";
		return name.substring(name.length - 2, name.length - 1) === "M"
			? "Mężczyźni"
			: "Kobiety";
	}
	if (name.startsWith("M") || name.startsWith("K")) return name.substring(1);
	return name.substring(0, name.length - 4);
}

const roundLabels: Record<number, Record<string, string>> = {
	1: { short: "EL", long: "Eliminacje" },
	2: { short: "PREELIM", long: "Preeliminacje" },
	3: { short: "F", long: "Finał" },
};
