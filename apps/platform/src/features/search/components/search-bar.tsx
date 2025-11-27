import type { Athlete, Discipline } from "@fan-athletics/shared/types";
import { Portal } from "@gorhom/portal";
import { Link, usePathname } from "expo-router";
import { Search } from "lucide-react-native";
import type React from "react";
import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Avatar, Input, Typography } from "#/components";
import { useEventQuery } from "#/features/events";
import { useSearchQuery } from "../services";

interface SearchBarProps extends React.ComponentProps<typeof View> {}

const SearchBar: React.FC<SearchBarProps> = ({ className = "", ...props }) => {
	const [searchValue, setSearchValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const pathname = usePathname();

	const { data: searchResult } = useSearchQuery(searchValue);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => setIsFocused(false), [pathname, setIsFocused]);

	return (
		<View className={`z-10 ${className}`}>
			{isFocused && (
				<Pressable
					className="top-0 left-0 z-20 fixed bg-black opacity-40 w-full h-screen"
					onPress={() => setIsFocused(false)}
				/>
			)}
			<View className="z-30 relative justify-center px-3 h-12" {...props}>
				<Input
					placeholder="Szukaj zawodników, dyscypliny lub wydarzenia"
					className={`pl-12 !rounded-full w-full h-full ${isFocused ? "bg-white placeholder:text-black" : "placeholder:text-gray-500"}`}
					onFocus={() => setIsFocused(true)}
					onChangeText={setSearchValue}
				/>
				<Search
					size={16}
					className={`left-8 absolute pointer-events-none ${isFocused ? "text-black" : "text-gray-500"}`}
				/>
				{isFocused && searchResult !== undefined && (
					<View className="top-full left-0 absolute items-center bg-white mt-2 px-4 py-5 rounded-2xl w-full text-center">
						{[...searchResult.athletes, ...searchResult.disciplines].length ===
						0 ? (
							<View className="gap-2 py-8">
								<Typography size="large">Nie znaleziono rezultatów</Typography>
								<Typography
									style={{ fontFamily: "inter-regular" }}
									type="washed"
								>
									There are no search results for
								</Typography>
							</View>
						) : (
							<View className="gap-3 w-full">
								{searchResult.athletes.length > 0 && (
									<View className="gap-2">
										<Typography className="px-2" type="washed">
											Zawodnicy
										</Typography>
										{searchResult.athletes.map((athlete) => (
											<AthleteSearchItem key={athlete.id} athlete={athlete} />
										))}
									</View>
								)}
								{searchResult.disciplines.length > 0 && (
									<View className="gap-2">
										<Typography className="px-2" type="washed">
											Dyscypliny
										</Typography>
										{searchResult.disciplines.map((discipline) => (
											<DisciplineSearchItem
												key={discipline.id}
												discipline={discipline}
											/>
										))}
									</View>
								)}
							</View>
						)}
					</View>
				)}
			</View>
		</View>
	);
};

export default SearchBar;

const AthleteSearchItem: React.FC<{
	athlete: Athlete;
}> = ({ athlete }) => {
	const { data: athleteEvent, isLoading } = useEventQuery(athlete.eventId);
	return (
		<Link
			key={athlete.id}
			href={`/events/${athlete.eventId}/athletes/${athlete.id}`}
			className="flex flex-row items-center gap-4 hover:bg-gray-100 p-2 rounded-xl"
		>
			<Avatar name={athlete.firstName} />
			<View className="gap-0.5">
				<Typography size="base">
					{athlete.firstName} {athlete.lastName}
				</Typography>
				<Typography type="washed">{athlete.coach}</Typography>
			</View>
			<View className="ms-auto p-1 rounded-md bg-white">
				<Image
					source={{ uri: athleteEvent?.icon }}
					style={{ width: 32, height: 32 }}
				/>
			</View>
		</Link>
	);
};

const DisciplineSearchItem: React.FC<{
	discipline: Discipline;
}> = ({ discipline }) => {
	const { data: disciplineEvent, isLoading } = useEventQuery(
		discipline.eventId,
	);
	return (
		<Link
			key={discipline.id}
			href={`/events/${discipline.eventId}/disciplines/${discipline.id}`}
			className="flex flex-row items-center gap-4 hover:bg-gray-100 p-2 rounded-xl"
		>
			<Avatar name={discipline.name} />
			<View className="gap-0.5">
				<Typography size="base">{discipline.name}</Typography>
				<Typography type="washed">{discipline.organization}</Typography>
			</View>
			<View className="ms-auto items-center bg-white p-1 rounded-md">
				<Image
					source={{ uri: disciplineEvent?.icon }}
					style={{ width: 32, height: 32 }}
				/>
			</View>
		</Link>
	);
};
