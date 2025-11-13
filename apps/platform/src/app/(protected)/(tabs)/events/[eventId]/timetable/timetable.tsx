import type { CompetitionWithCompetitors } from "@fan-athletics/shared/types";
import { Link } from "expo-router";
import { CircleUser } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Switch, Typography } from "#/components";
import { useEventQuery } from "#/features/events";
import { GradientBox, GradientType, getFlagUrl } from "../participation/utils";

export const Timetable: React.FC<{
	competitions: CompetitionWithCompetitors[];
}> = ({ competitions }) => {
	const [currentDay, setCurrentDay] = useState<string | undefined>(undefined);
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
	console.log(
		"Comp: ",
		competitions[0],
		typeof competitions[0],
		competitions.length,
	);

	return (
		<View className="flex-row py-3 px-5">
			<View className="w-[20%]">
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
				{currentDay !== undefined && (
					<CompetitionsList
						competitions={competitions.filter(
							(c) => c.startAt.toISOString().substring(0, 10) === currentDay,
						)}
						onCompetitionSelect={setSelectedCompetition}
						selectedCompetition={selectedCompetition}
					/>
				)}
			</View>
			{selectedCompetition && (
				<View className="w-[60%]">
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
		const key = `${c.disciplineId}-${c.round}`;
		if (competitionsConsolidated.has(key)) {
			competitionsConsolidated.set(
				key,
				(competitionsConsolidated.get(key) ?? []).concat(c),
			);
		} else {
			competitionsConsolidated.set(`${c.disciplineId}-${c.round}`, [c]);
		}
	});
	console.log(competitionsConsolidated);

	return (
		<View className="w-full gap-y-1">
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
	const hour = new Date(competitions[0].startAt)
		.toISOString()
		.substring(11, 16);
	const key = `${competitions[0].disciplineId}-${competitions[0].round}`;
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const colors = {
		normal: "#973232",
		hover: "#FF5100",
	};
	const isSelected = currentlySelectedBar === key;
	const barInfoColor = isSelected || isHovered ? colors.hover : colors.normal;

	return (
		<View>
			<Pressable
				onPress={onPress}
				onHoverIn={() => setIsHovered(true)}
				onHoverOut={() => setIsHovered(false)}
			>
				<View
					className="flex-row w-full rounded-full justify-center bg-[#EFEFEF] border"
					style={{ borderColor: barInfoColor }}
				>
					<Typography className="ms-2">{hour}</Typography>
					<View
						className="px-3 ms-auto w-[70%] rounded-full"
						style={{ backgroundColor: barInfoColor }}
					>
						<Typography type="bright" className="ms-auto">
							{competitions[0].discipline.name}{" "}
							{roundLabels[competitions[0].round].short}
						</Typography>
					</View>
				</View>
			</Pressable>
			{currentlySelectedBar === key && competitions.length > 1 && (
				<View className="py-2 rounded-full gap-y-1">
					{competitions
						.sort((a, b) => {
							if (a.series < b.series) return -1;
							return 1;
						})
						.map(
							(c) =>
								c.competitors.length > 0 && ( //Trzeba na backendzie zrobić jakieś poprawki, bo finały A się kilka razy pobierają
									<Pressable
										onPress={() => onCompetitionSelect(c)}
										className="w-[70%] ms-auto"
									>
										<View
											className="px-2 border rounded-full"
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

	return (
		// Pasowałoby to przerobić na tabelkę
		<View className="w-full ms-5">
			<Typography size="large4" className="mb-3">
				{competition.discipline.name} -{" "}
				{convertSeriesName(competition.note, competition.round)}
			</Typography>
			<GradientBox sex="K" gradientType={GradientType.CAPTAIN} horizontal>
				<View className="flex-row gap-x-4 my-2 mx-3">
					<Typography size="base" type="bright" className="w-[7%]">
						Miejsce
					</Typography>
					<Typography size="base" type="bright" className="w-[7%]">
						Numer
					</Typography>
					<Typography size="base" type="bright" className="w-[25%]">
						Zawodnik
					</Typography>
					<Typography size="base" type="bright" className="w-[25%]">
						Klub
					</Typography>
					<Typography size="base" type="bright" className="w-[20%]">
						Narodowość
					</Typography>
					<Typography size="base" type="bright" className="w-[10%]">
						Wynik
					</Typography>
				</View>
			</GradientBox>
			<View className="mt-3">
				{competition.competitors
					.sort((a, b) => {
						if (a.place < b.place) return -1;
						return 1;
					})
					.map((competitor, index) => (
						<View
							key={`${competitor.id}-${competition.id}`}
							className="flex-row gap-x-4 py-2 px-3 items-center"
							style={{ backgroundColor: index % 2 === 0 ? "white" : "#EFEFEF" }}
						>
							<Typography className="w-[7%]">
								{competitor.place !== 9999 && competitor.place}
							</Typography>
							<Typography className="w-[7%]">{competitor.number}</Typography>
							<Link
								href={`/events/${event.id}/athletes/${competitor.id}`}
								className="w-[25%]"
							>
								<View className="flex-row items-center gap-x-2">
									{competitor.imageUrl ? (
										<Image
											source={{ uri: competitor.imageUrl }}
											style={{ width: 32, height: 32 }}
										/>
									) : (
										<CircleUser size={32} />
									)}
									<Typography>
										{competitor.firstName} {competitor.lastName}
									</Typography>
								</View>
							</Link>
							<Typography className="w-[25%]">{competitor.club}</Typography>
							<View className="flex-row w-[20%]">
								<Image
									source={{ uri: getFlagUrl(competitor.nationality) }}
									style={{ width: 32, height: 24 }}
								/>
							</View>
							<Typography className="w-[10%]">
								{competitor.results.score}
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

const roundLabels: Record<number, Record<string, string>> = {
	1: { short: "EL", long: "Eliminacje" },
	2: { short: "PREELIM", long: "Preeliminacje" },
	3: { short: "F", long: "Finał" },
};
