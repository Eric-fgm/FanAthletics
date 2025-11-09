import { Star } from "lucide-react-native";
import type React from "react";
import { StyleSheet, View } from "react-native";
import {
	Circle,
	Defs,
	LinearGradient,
	Path,
	Polygon,
	Rect,
	Stop,
	Svg,
} from "react-native-svg";
import { Typography } from "#/components";

export enum GradientType {
	PROFILE = 0,
	CAPTAIN = 1,
	HONOURS = 2,
}

export const menColors = {
	profileUpGradient: "#0B89A5",
	profileDownGradient: "#8EEAFF",
	honoursUpGradient: "#077D8F",
	honoursDownGradient: "#60CAE2",
	captainUpGradient: "#60CAE2",
	captainDownGradient: "#077D8F",
	basicInfoColor: "#CCF6FF",
};
export const womenColors = {
	profileUpGradient: "#FF5757",
	profileDownGradient: "#FFB2B2",
	honoursUpGradient: "#6E2121",
	honoursDownGradient: "#DB3131",
	captainUpGradient: "#DB3131",
	captainDownGradient: "#6E2121",
	basicInfoColor: "#FFC4C4",
};

export type AthleteColors = typeof menColors;

type GradientBoxProps = {
	sex: string;
	vertical?: boolean;
	horizontal?: boolean;
	gradientType: GradientType;
	borderRad?: number;
	children?: React.ReactNode;
};

export const GradientBox: React.FC<GradientBoxProps> = (props) => {
	const { sex, vertical, horizontal, gradientType, borderRad, children } =
		props;
	const radius = props.borderRad ?? 16;
	const colors = sex === "M" ? menColors : womenColors;
	let leftUpColor: string;
	let rightDownColor: string;
	switch (gradientType) {
		case GradientType.PROFILE:
			leftUpColor = colors.profileUpGradient;
			rightDownColor = colors.profileDownGradient;
			break;
		case GradientType.CAPTAIN:
			leftUpColor = colors.captainUpGradient;
			rightDownColor = colors.captainDownGradient;
			break;
		case GradientType.HONOURS:
			leftUpColor = colors.honoursUpGradient;
			rightDownColor = colors.honoursDownGradient;
			break;
	}
	return (
		<View>
			<Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
				<Defs>
					<LinearGradient
						id={`${sex}.${gradientType}.grad`}
						x1={0}
						x2={horizontal ? 1 : 0}
						y1={0}
						y2={vertical ? 1 : 0}
					>
						<Stop offset={0} stopColor={leftUpColor} />
						<Stop offset={1} stopColor={rightDownColor} />
					</LinearGradient>
				</Defs>
				<Rect
					x={0}
					y={0}
					width="100%"
					height="100%"
					rx={radius}
					ry={radius}
					fill={`url(#${sex}.${gradientType}.grad)`}
				/>
			</Svg>

			<View>{children}</View>
		</View>
	);
};

export const AthleteCostBox: React.FC<{
	cost: number;
	children?: React.ReactNode;
}> = ({ cost }) => {
	return (
		<View style={{ width: 110, height: 50 }}>
			<Svg width={114} height={56}>
				<Path
					d="M 15 0 H 91 C 110 0 110 20 110 20 V 40 C 110 50 100 50 100 50 H 46 C 37 50 32 42 32 42 L 8 10 C 0 0 15 0 15 0"
					stroke="#C0AA00"
					strokeWidth={2}
					fill="#F9F9F9"
				/>
			</Svg>
			<View
				className="flex-row items-center"
				style={{ ...StyleSheet.absoluteFillObject }}
			>
				<Typography
					size="large2-s"
					className="ms-9 me-1"
					style={{ color: "#C0AA00" }}
				>
					{cost}
				</Typography>
				<Star width={24} height={24} strokeWidth={3} color="#C0AA00" />
			</View>
		</View>
	);
};

export const countries: Record<
	string,
	{ polishName: string; code: string; continent: string }
> = {
	Andorra: { polishName: "Andora", code: "AD", continent: "Europe" },
	Albania: { polishName: "Albania", code: "AL", continent: "Europe" },
	Austria: { polishName: "Austria", code: "AT", continent: "Europe" },
	"Bosnia and Herzegovina": {
		polishName: "Bośnia i Hercegowina",
		code: "BA",
		continent: "Europe",
	},
	Belgium: { polishName: "Belgia", code: "BE", continent: "Europe" },
	Bulgaria: { polishName: "Bułgaria", code: "BG", continent: "Europe" },
	Poland: { polishName: "Polska", code: "PL", continent: "Europe" },
};

export const StarBadge: React.FC<{
	width: number;
	height: number;
	colorCircle: string;
	colorStar: string;
}> = ({ width, height, colorCircle, colorStar }) => {
	const starPoints = [
		[50, 17],
		[58, 42],
		[82, 42],
		[62, 56],
		[70, 78],
		[50, 63],
		[30, 78],
		[38, 56],
		[18, 42],
		[42, 42],
	]
		.map(([x, y]) => `${x},${y}`)
		.join(" ");

	return (
		<Svg width={width} height={height} viewBox="0 0 100 100">
			<Circle cx={50} cy={50} r={50} fill={colorCircle} />
			<Polygon points={starPoints} fill={colorStar} />
		</Svg>
	);
};
