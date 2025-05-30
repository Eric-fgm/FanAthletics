import { Image, Pressable, type PressableProps } from "react-native";
import { Typography } from "#/components";

interface AvatarProps extends PressableProps {
	name?: string;
	image?: string | null;
}

const Avatar: React.FC<AvatarProps> = ({
	name,
	image,
	className = "",
	...props
}) => {
	return (
		<Pressable
			className={`flex items-center justify-center bg-gray-100 w-9 h-9 overflow-hidden rounded-full ${className}`}
			{...props}
		>
			{image ? (
				<Image source={{ uri: image }} className="w-full h-full" />
			) : (
				<Typography type="washed">{!name?.length ? "?" : name[0]}</Typography>
			)}
		</Pressable>
	);
};

export default Avatar;
