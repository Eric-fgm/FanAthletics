import { Image, Pressable, type PressableProps } from "react-native";
import { Typography } from "#/components";

interface AvatarProps extends PressableProps {
	name?: string;
	image?: string | null;
	size?: keyof typeof sizeClassNamesMap;
}

const sizeClassNamesMap = {
	normal: "w-9 h-9",
	large: "w-20 h-20",
};

const Avatar: React.FC<AvatarProps> = ({
	name,
	image,
	size = "normal",
	className = "",
	...props
}) => {
	return (
		<Pressable
			className={`flex items-center justify-center bg-gray-100 overflow-hidden rounded-full ${className} ${sizeClassNamesMap[size]}`}
			{...props}
		>
			{image ? (
				<Image source={{ uri: image }} className="w-full h-full" />
			) : (
				<Typography size={size === "large" ? "large2" : "normal"} type="washed">
					{!name?.length ? "?" : name[0]}
				</Typography>
			)}
		</Pressable>
	);
};

export default Avatar;
