import { Star } from "lucide-react-native";
import type React from "react";
import { StyleSheet, View } from "react-native";
import { Defs, LinearGradient, Path, Rect, Stop, Svg } from "react-native-svg";
import { Typography } from "#/components";

export const menColors = {
	cardUpGradient: "#0B89A5",
	cardDownGradient: "#8EEAFF",
	captainAndHonoursUpGradient: "#077D8F",
	captainAndHonoursDownGradient: "#60CAE2",
	basicInfoColor: "#CCF6FF",
};
export const womenColors = {
	cardUpGradient: "#FF5757",
	cardDownGradient: "#FFB2B2",
	captainAndHonoursUpGradient: "#6E2121",
	captainAndHonoursDownGradient: "#DB3131",
	basicInfoColor: "#FFC4C4",
};

export type AthleteColors = typeof menColors;

export const GradientBox: React.FC<{
	sex: string;
	vertical?: boolean;
	horizontal?: boolean;
	leftUpColor: string;
	rightDownColor: string;
	children?: React.ReactNode;
}> = ({ sex, vertical, horizontal, leftUpColor, rightDownColor, children }) => {
	return (
		<View>
			<Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
				<Defs>
					<LinearGradient
						id={`${sex}.grad`}
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
					rx={16}
					ry={16}
					fill={`url(#${sex}.grad)`}
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
					size="large2"
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
