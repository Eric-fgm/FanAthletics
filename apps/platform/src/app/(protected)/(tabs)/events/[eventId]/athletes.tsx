import { Button, Divider, Dropdown, Switch, Table, Typography } from "#/components";
import { useEventAthletesQuery } from "#/features/events";
import { CircleUser, Ellipsis } from "lucide-react-native";
import { Image, ScrollView, View } from "react-native";

const columns = [{
	key: 'imageUrl',
	name: <View className="basis-2/3"><Typography size="small" type="washed">Nazwa</Typography></View>,
	render: ({ imageUrl, firstName, lastName, disciplines }: { imageUrl: string | null; firstName: string; lastName: string; disciplines: { name: string }[] }) => <View className="flex-row gap-4 basis-2/3">
		<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12">
			{imageUrl ? <Image source={{ uri: imageUrl }} className="w-full h-full" /> : <CircleUser className="w-5 text-gray-600" />}
		</View>
		<View className="justify-center gap-0.5">
			<Typography>{firstName} {lastName}</Typography>
			<Typography size="small" type="washed">{disciplines.map(({ name }) => name).join(", ")}</Typography>
		</View>
	</View>
}, {
	key: 'cost', name: "Koszt", render: ({ cost }: { cost: number }) => <View >
		<Typography >{cost} XP</Typography>
	</View>
}, {
	key: 'action', name: "", render: () => <View className="ml-auto">
		<Dropdown className="!mt-2" trigger={<View className="justify-center items-center hover:bg-gray-100 rounded-full w-8 h-8"><Ellipsis size={20} /></View>} items={[{ name: 'Zobacz więcej' }]} />
	</View>
}]

export default function EventAthletes() {
	const { data: athletes = [] } = useEventAthletesQuery()

	return <ScrollView className="px-4 md:px-8 xl:px-24 py-8">
		<Typography size="large4.5">Zawodnicy</Typography>
		<View className="gap-8 mt-6">
			<View className="flex-row items-center gap-4">
				<Switch
					items={[
						{ name: "Wszystkie", value: "all" },
						{ name: "Aktywne", value: "active" },
					]}
					value="all"
				/>
				<Divider orientation="vertical" className="h-8" />
				<Button variant="outlined" text="Druźyna" className="!h-11" rounded />
				<Button variant="outlined" text="Najnowsze" className="!h-11" rounded />
			</View>
			<Table columns={columns} data={athletes} />
		</View>
	</ScrollView>
}
