import type {
	AthleteWithDisciplines,
	Discipline,
} from "@fan-athletics/shared/types";
import { CircleUser, Globe } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { countries } from "#/app/(protected)/(tabs)/events/[eventId]/participation/utils";
import {
	Button,
	Dialog,
	Dropdown,
	Switch,
	Toggle,
	Typography,
} from "#/components";
import {
	useEventAthletesQuery,
	useEventDiscpilinesQuery,
} from "#/features/events";

interface AthletesSearchDialogProps
	extends React.ComponentProps<typeof Dialog> {
	disabledAtletes?: string[];
	budget: number;
	onSelect?: (athlete: AthleteWithDisciplines) => void;
}

const AthletesSearchDialog: React.FC<AthletesSearchDialogProps> = ({
	disabledAtletes = [],
	budget,
	onSelect,
	...props
}) => {
	const MAX_ATHLETE_COST = 200; // Pasuje to przenieść gdzieś albo ustawiać w parametrach wydarzenia i tutaj przekazywać.
	const [searchValue, setSearchValue] = useState("");
	const { data: athletes = [], isLoading } = useEventAthletesQuery();
	const { data: disciplines = [] } = useEventDiscpilinesQuery();
	disciplines.sort((a, b) => {
		if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
		return 1;
	});

	const nationalities = [
		...new Set(athletes.map((athlete) => athlete.nationality)),
	];
	nationalities.push("Albania", "Bosnia and Herzegovina");

	const [currentSex, setCurrentSex] = useState("both");
	const [currentDiscipline, setCurrentDiscipline] = useState<Discipline>();
	const [minAthleteCost, setMinAthleteCost] = useState(0);
	const [maxAthleteCost, setMaxAthleteCost] = useState(MAX_ATHLETE_COST);
	const [inBudget, setInBudget] = useState(false);
	const [currentNationality, setCurrentNationality] = useState<string>("");

	const filteredAthletes = athletes.filter((athlete) => {
		const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
		const genderMatches = currentSex === "both" || athlete.sex === currentSex;
		const startsInCurrentDiscipline =
			currentDiscipline === undefined ||
			athlete.disciplines.some(
				(discipline) => discipline.id === currentDiscipline.id,
			);
		const costBetweenMinAndMax =
			athlete.cost >= minAthleteCost && athlete.cost <= maxAthleteCost;
		const affordableInBudget =
			(inBudget && athlete.cost <= budget) || !inBudget;
		const nationalityMatches =
			currentNationality === "" || athlete.nationality === currentNationality;
		return (
			fullName.includes(searchValue.trim().toLowerCase()) &&
			genderMatches &&
			startsInCurrentDiscipline &&
			costBetweenMinAndMax &&
			affordableInBudget &&
			nationalityMatches
		);
	});

	function resetFilters() {
		setSearchValue("");
		setCurrentSex("both");
		setCurrentDiscipline(undefined);
		setMinAthleteCost(0);
		setMaxAthleteCost(MAX_ATHLETE_COST);
		setInBudget(false);
		setCurrentNationality("");
	}

	return (
		<Dialog {...props}>
			<View
				className="px-5 py-4 h-full"
				style={{ flexGrow: 1, minHeight: 524 }}
			>
				<Typography size="large" className="mb-3">
					Dodaj zawodnika
				</Typography>
				<View className="flex-col md:flex-row">
					<View
						className="flex-col rounded-2xl p-3 flex-[0.4] h-full"
						style={{ backgroundColor: "#FFC5C5" }}
					>
						<TextInput
							placeholder="Szukaj zawodnika"
							className="w-full bg-gray-100 px-4 rounded-xl h-10 placeholder:text-gray-500 mb-3"
							value={searchValue}
							onChange={(event) => setSearchValue(event.nativeEvent.text)}
						/>
						<View
							className="w-fullh-[10px] rounded-2xl mb-3"
							style={{ height: 2, backgroundColor: "#973232" }}
						/>
						<Switch
							items={[
								{ name: "Wszyscy", value: "both" },
								{ name: "Mężczyźni", value: "M" },
								{ name: "Kobiety", value: "K" },
							]}
							value={currentSex.toString()}
							onChange={(value) => setCurrentSex(value)}
							className="mb-4 w-full items-center justify-between"
						/>
						<Typography size="large1" className="mb-2 px-2">
							Konkurencja
						</Typography>
						<Dropdown
							trigger={
								<Button
									text={
										currentDiscipline === undefined
											? "Wybierz dyscyplinę"
											: currentDiscipline.name
									}
									className="w-full"
									rounded
								/>
							}
							items={[
								{
									name: "Wybierz konkurencję",
									onPress: () => setCurrentDiscipline(undefined),
									className: "bg-gray-400",
								},
							].concat(
								disciplines.map((discipline) => {
									return {
										name: discipline.name,
										onPress: () => setCurrentDiscipline(discipline),
										className: "",
									};
								}),
							)}
						/>
						<Typography size="large1" className="mt-4 mb-2 px-2">
							Koszt
						</Typography>
						<View className="flex-row w-full gap-2 mb-2">
							<TextInput
								placeholder="Min"
								keyboardType="numeric"
								className="w-full bg-gray-100 px-4 rounded-xl h-10 placeholder:text-gray-500 mb-3 flex-[0.5]"
								value={minAthleteCost.toString()}
								onChange={(event) =>
									setMinAthleteCost(
										Math.min(
											Number(event.nativeEvent.text) || 0,
											MAX_ATHLETE_COST,
										),
									)
								}
							/>
							<TextInput
								placeholder="Max"
								keyboardType="numeric"
								className="w-full bg-gray-100 px-4 rounded-xl h-10 placeholder:text-gray-500 mb-3 flex-[0.5]"
								value={maxAthleteCost.toString()}
								onChange={(event) =>
									setMaxAthleteCost(
										Math.min(
											Number(event.nativeEvent.text) || MAX_ATHLETE_COST,
											MAX_ATHLETE_COST,
										),
									)
								}
							/>
						</View>
						<View className="flex-row w-full mb-4">
							<Typography size="large1" className="px-2">
								W budżecie
							</Typography>
							<Toggle
								value={inBudget}
								onChangeValue={() => setInBudget(!inBudget)}
								className="ms-auto"
							/>
						</View>
						<Typography size="large1" className="px-2 mb-2">
							Narodowość
						</Typography>
						<Dropdown
							trigger={
								<Button
									text={
										currentNationality !== ""
											? countries[currentNationality].polishName
											: "Wybierz narodowość"
									}
									imageUrl={
										currentNationality !== ""
											? `https://flagsapi.com/${countries[currentNationality].code}/flat/64.png`
											: undefined
									}
									icon={currentNationality === "" ? Globe : undefined}
								/>
							}
							items={[
								{
									name: "Wybierz narodowość",
									onPress: () => setCurrentNationality(""),
									className: "bg-gray-400",
								},
							].concat(
								nationalities.map((nationality) => {
									return {
										name: countries[nationality].polishName,
										imageUrl: `https://flagsapi.com/${countries[nationality].code}/flat/64.png`,
										onPress: () => setCurrentNationality(nationality),
										className: "",
									};
								}),
							)}
						/>
					</View>
					<View className="flex-column p-3 flex-[0.6]">
						{filteredAthletes.length === 0 ? (
							<View className="items-center gap-y-0.5 py-8">
								<Typography size="base">Nie znaleziono</Typography>
								<Typography
									style={{ fontFamily: "inter-regular" }}
									type="washed"
								>
									Spróbuj zmienić filtry.
								</Typography>
							</View>
						) : (
							<ScrollView className="gap-y-2 px-6 pt-4 pb-2 border-gray-200 border-t max-h-[524px]">
								{filteredAthletes.map((athlete) => {
									const isDisabled = disabledAtletes.includes(athlete.id);
									return (
										<Pressable
											key={athlete.id}
											disabled={isDisabled}
											className={`flex-row items-center gap-3 py-4 border-gray-200 last:border-0 border-b ${isDisabled ? "opacity-65 cursor-default" : ""}`}
											onPress={() => {
												resetFilters();
												onSelect?.(athlete);
											}}
										>
											<View className="justify-center items-center bg-gray-100 rounded-full w-11 h-11">
												{athlete.imageUrl ? (
													<Image
														source={{ uri: athlete.imageUrl }}
														className="w-full h-full rounded-full"
													/>
												) : (
													<CircleUser size={18} className="text-gray-600" />
												)}
											</View>
											<View className="gap-1">
												<Typography>
													{athlete.firstName} {athlete.lastName}
												</Typography>
												<Typography size="small" type="washed">
													{athlete.coach}
												</Typography>
											</View>
											<Typography className="ms-auto">{athlete.cost} XP</Typography>
										</Pressable>
									);
								})}
							</ScrollView>
						)}
					</View>
				</View>
			</View>
		</Dialog>
	);
};

export default AthletesSearchDialog;
