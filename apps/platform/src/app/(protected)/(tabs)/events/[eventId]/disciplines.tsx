import { Button, Divider, Dropdown, Switch, Table, Typography } from "#/components";
import { useEventDiscpilinesQuery } from "#/features/events";
import { Ellipsis, Trophy } from "lucide-react-native";
import { ScrollView, View } from "react-native";

const getIcon = (icon: string) => {
	return {}[icon] ?? Trophy
}

const columns = [{
	key: 'name',
	name: 'Nazwa',
	render: ({ icon, name, organization }: { icon: string; name: string; organization: string }) => {
		const Icon = getIcon(icon)
		return <View className="flex-row gap-4">
			<View className="justify-center items-center bg-gray-100 rounded-full w-12 h-12"><Icon className="w-5 text-gray-500" /></View>
			<View className="justify-center gap-0.5">
				<Typography>{name}</Typography>
				<Typography size="small" type="washed">{organization ?? "Brak informacji"}</Typography>
			</View>
		</View>
	}
}, {
	key: 'action', name: "", render: () => <View className="ml-auto">
		<Dropdown className="!mt-2" trigger={<View className="justify-center items-center hover:bg-gray-100 rounded-full w-8 h-8"><Ellipsis size={20} /></View>} items={[{ name: 'Zobacz więcej' }]} />
	</View>
}]

export default function EventDisciplines() {
	const { data: events = [] } = useEventDiscpilinesQuery()

	return <ScrollView className="px-4 md:px-8 xl:px-24 py-8">
		<Typography size="large4.5">Dyscypliny</Typography>
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
			<Table columns={columns} data={events} />
		</View>
	</ScrollView>
}
