import type {
	Athlete,
	AthleteWithDisciplines,
	Discipline,
	GameSpecification,
} from "@fan-athletics/shared/types";
import { CircleUser, Globe } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Image, Pressable, ScrollView, TextInput, View } from "react-native";
import { countries, getFlagUrl } from "#/app/(protected)/(tabs)/events/[eventId]/participation/utils";
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
	disabledAtletes?: AthleteIdAndSex[];
	budget: number;
	gameSpecification: GameSpecification;
	onSelect?: (athlete: AthleteWithDisciplines) => void;
}

const AthletesSearchDialog: React.FC<AthletesSearchDialogProps> = ({
	disabledAtletes = [],
	budget,
	gameSpecification,
	onSelect,
	...props
}) => {
	const [searchValue, setSearchValue] = useState("");
	const { data: athletes = [], isLoading } = useEventAthletesQuery();
	const { data: disciplines = [] } = useEventDiscpilinesQuery();
	disciplines.sort((a, b) => {
		if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
		return 1;
	});

	const nationalities = [
		...new Set(athletes.map((athlete) => athlete.nationality)),
	].sort((a, b) => {
		if (countries[a] && countries[b] && countries[a].polishName.toLowerCase() < countries[b].polishName.toLowerCase())
			return -1;
		return 1;
	});

	const [currentSex, setCurrentSex] = useState("both");
	const [currentDiscipline, setCurrentDiscipline] = useState<Discipline>();
	const [minAthleteCost, setMinAthleteCost] = useState(
		gameSpecification.minAthleteCost,
	);
	const [maxAthleteCost, setMaxAthleteCost] = useState(
		gameSpecification.maxAthleteCost,
	);
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
		setMinAthleteCost(gameSpecification.minAthleteCost);
		setMaxAthleteCost(gameSpecification.maxAthleteCost);
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
											Number(event.nativeEvent.text) ||
												gameSpecification.minAthleteCost,
											gameSpecification.maxAthleteCost,
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
											Number(event.nativeEvent.text) ||
												gameSpecification.maxAthleteCost,
											gameSpecification.maxAthleteCost,
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
											? (countries[currentNationality] ? countries[currentNationality].polishName : currentNationality)
											: "Wybierz narodowość"
									}
									imageUrl={
										currentNationality !== ""
											? getFlagUrl(currentNationality)
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
										name: countries[nationality] ? countries[nationality].polishName : nationality,
										imageUrl: getFlagUrl(nationality),
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
									const isDisabled =
										disabledAtletes.map((ath) => ath.id).includes(athlete.id) ||
										!checkIfAthleteIsAffordable(
											athlete,
											budget,
											gameSpecification,
											disabledAtletes,
										);
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
											<Typography className="ms-auto">
												{athlete.cost} XP
											</Typography>
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

export interface AthleteIdAndSex {
	id: string;
	sex: "M" | "K";
}

function checkIfAthleteIsAffordable(
	athlete: Athlete,
	budget: number,
	gameSpecification: GameSpecification,
	currentTeam: AthleteIdAndSex[],
) {
	if (athlete.cost > budget) return false;
	if (!gameSpecification.sexParity) return true;

	const currentNumOfMen = currentTeam.filter((ath) => ath.sex === "M").length;
	const currentNumOfWomen = currentTeam.filter((ath) => ath.sex === "K").length;
	const maxNumOfAthletesOfOneSex = Math.floor(
		(gameSpecification.numberOfTeamMembers + 1) / 2,
	);

	if (athlete.sex === "M" && currentNumOfMen >= maxNumOfAthletesOfOneSex)
		return false;
	if (athlete.sex === "K" && currentNumOfWomen >= maxNumOfAthletesOfOneSex)
		return false;
	return true;
}
