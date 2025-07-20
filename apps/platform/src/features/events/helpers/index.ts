import { Trophy } from "lucide-react-native";

export const getDisciplineIcon = (icon: string) => {
	return {}[icon] ?? Trophy;
};
