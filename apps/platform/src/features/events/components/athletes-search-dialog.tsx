import type { AthleteWithDisciplines } from "@fan-athletics/shared/types";
import { CircleUser } from "lucide-react-native";
import type React from "react";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Dialog, Typography } from "#/components";
import { useEventAthletesQuery } from "#/features/events";

interface AthletesSearchDialogProps
	extends React.ComponentProps<typeof Dialog> {
	disabledAtletes?: string[];
	onSelect?: (athlete: AthleteWithDisciplines) => void;
}

const AthletesSearchDialog: React.FC<AthletesSearchDialogProps> = ({
	disabledAtletes = [],
	onSelect,
	...props
}) => {
	const [searchValue, setSearchValue] = useState("");
	const { data: athletes = [] } = useEventAthletesQuery();

	const filteredAthletes = athletes.filter((athlete) => {
		const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
		return fullName.includes(searchValue.trim().toLowerCase());
	});

	return (
		<Dialog {...props}>
			<View className="px-6 py-4">
				<Typography size="large">Wybierz zawodnika</Typography>
				<Typography type="washed" style={{ fontFamily: "inter-regular" }}>
					Znajdź zawodnika, którego chcesz dodać.
				</Typography>
			</View>
			<View className="gap-y-2 px-6 pt-4 pb-2 border-gray-200 border-t">
				<TextInput
					placeholder="Szukaj zawodników"
					className="bg-gray-100 px-4 rounded-xl h-10 placeholder:text-gray-500"
					value={searchValue}
					onChange={(event) => setSearchValue(event.nativeEvent.text)}
				/>
				{/* <Typography size="base" className="mt-4">
					Znaleziono {athletes.length} zawodników
				</Typography> */}
				{filteredAthletes.length === 0 ? (
					<View className="items-center gap-y-0.5 py-8">
						<Typography size="base">Nie znaleziono</Typography>
						<Typography style={{ fontFamily: "inter-regular" }} type="washed">
							Spróbuj zmienić filtry.
						</Typography>
					</View>
				) : (
					<View>
						{filteredAthletes.slice(0, 5).map((athlete) => {
							const isDisabled = disabledAtletes.includes(athlete.id);
							return (
								<Pressable
									key={athlete.id}
									disabled={isDisabled}
									className={`flex-row items-center gap-3 py-4 border-gray-200 last:border-0 border-b ${isDisabled ? "opacity-65 cursor-default" : ""}`}
									onPress={() => onSelect?.(athlete)}
								>
									<View className="justify-center items-center bg-gray-100 rounded-full w-11 h-11">
										<CircleUser size={18} className="text-gray-600" />
									</View>
									<View className="gap-1">
										<Typography>
											{athlete.firstName} {athlete.lastName}
										</Typography>
										<Typography size="small" type="washed">
											{athlete.coach}
										</Typography>
									</View>
								</Pressable>
							);
						})}
					</View>
				)}
			</View>
		</Dialog>
	);
};

export default AthletesSearchDialog;
