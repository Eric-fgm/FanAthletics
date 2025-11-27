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
	POINTS = 3,
}

export const menColors = {
	profileUpGradient: "#0B89A5",
	profileDownGradient: "#8EEAFF",
	honoursUpGradient: "#077D8F",
	honoursDownGradient: "#60CAE2",
	captainUpGradient: "#60CAE2",
	captainDownGradient: "#077D8F",
	pointsUpGradient: "#0A96ACFF",
	basicInfoColor: "#CCF6FF",
};
export const womenColors = {
	profileUpGradient: "#FF5757",
	profileDownGradient: "#FFB2B2",
	honoursUpGradient: "#6E2121",
	honoursDownGradient: "#DB3131",
	captainUpGradient: "#DB3131",
	captainDownGradient: "#6E2121",
	pointsUpGradient: "#B70000",
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
	const radius = props.borderRad;
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
		case GradientType.POINTS:
			leftUpColor = colors.pointsUpGradient;
			rightDownColor = colors.captainUpGradient;
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
					strokeWidth={3}
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

export const countries: Record<
	string,
	{ polishName: string; code: string; continent: string }
> = {
	AFGHANISTAN: { polishName: "Afganistan", code: "AF", continent: "Asia" },
	"ÅLAND ISLANDS": { polishName: "Wyspy Alandzkie", code: "AX", continent: "Europe" },
	ALBANIA: { polishName: "Albania", code: "AL", continent: "Europe" },
	ALGERIA: { polishName: "Algieria", code: "DZ", continent: "Africa" },
	"AMERICAN SAMOA": { polishName: "Samoa Amerykańskie", code: "AS", continent: "Oceania" },
	ANDORRA: { polishName: "Andora", code: "AD", continent: "Europe" },
	ANGOLA: { polishName: "Angola", code: "AO", continent: "Africa" },
	ANGUILLA: { polishName: "Anguilla", code: "AI", continent: "North America" },
	ANTARCTICA: { polishName: "Antarktyda", code: "AQ", continent: "Antarctica" },
	"ANTIGUA AND BARBUDA": { polishName: "Antigua i Barbuda", code: "AG", continent: "North America" },
	ARGENTINA: { polishName: "Argentyna", code: "AR", continent: "South America" },
	ARMENIA: { polishName: "Armenia", code: "AM", continent: "Asia" },
	ARUBA: { polishName: "Aruba", code: "AW", continent: "North America" },
	AUSTRALIA: { polishName: "Australia", code: "AU", continent: "Oceania" },
	AUSTRIA: { polishName: "Austria", code: "AT", continent: "Europe" },
	AZERBAIJAN: { polishName: "Azerbejdżan", code: "AZ", continent: "Asia" },
	BAHAMAS: { polishName: "Bahamy", code: "BS", continent: "North America" },
	BAHRAIN: { polishName: "Bahrajn", code: "BH", continent: "Asia" },
	BANGLADESH: { polishName: "Bangladesz", code: "BD", continent: "Asia" },
	BARBADOS: { polishName: "Barbados", code: "BB", continent: "North America" },
  	BELARUS: { polishName: "Białoruś", code: "BY", continent: "Europe" },
	BELGIUM: { polishName: "Belgia", code: "BE", continent: "Europe" },
	BELIZE: { polishName: "Belize", code: "BZ", continent: "North America" },
	BENIN: { polishName: "Benin", code: "BJ", continent: "Africa" },
	BERMUDA: { polishName: "Bermudy", code: "BM", continent: "North America" },
	BHUTAN: { polishName: "Bhutan", code: "BT", continent: "Asia" },
	BOLIVIA: { polishName: "Boliwia", code: "BO", continent: "South America" },
	"BOSNIA AND HERZEGOVINA": { polishName: "Bośnia i Hercegowina", code: "BA", continent: "Europe" },
	BOTSWANA: { polishName: "Botswana", code: "BW", continent: "Africa" },
	BRAZIL: { polishName: "Brazylia", code: "BR", continent: "South America" },
	"BRUNEI DARUSSALAM": { polishName: "Brunei", code: "BN", continent: "Asia" },
	BULGARIA: { polishName: "Bułgaria", code: "BG", continent: "Europe" },
	"BURKINA FASO": { polishName: "Burkina Faso", code: "BF", continent: "Africa" },
	BURUNDI: { polishName: "Burundi", code: "BI", continent: "Africa" },
	CAMEROON: { polishName: "Kamerun", code: "CM", continent: "Africa" },
	CANADA: { polishName: "Kanada", code: "CA", continent: "North America" },
	"CENTRAL AFRICAN REPUBLIC": { polishName: "Republika Środkowoafrykańska", code: "CF", continent: "Africa" },
	CHILE: { polishName: "Chile", code: "CL", continent: "South America" },
	CHINA: { polishName: "Chiny", code: "CN", continent: "Asia" },
	COLOMBIA: { polishName: "Kolumbia", code: "CO", continent: "South America" },
	CONGO: { polishName: "Kongo", code: "CG", continent: "Africa" },
	"COSTA RICA": { polishName: "Kostaryka", code: "CR", continent: "North America" },
	"CÔTE D'IVOIRE": { polishName: "Wybrzeże Kości Słoniowej", code: "CI", continent: "Africa" },
	CROATIA: { polishName: "Chorwacja", code: "HR", continent: "Europe" },
	CUBA: { polishName: "Kuba", code: "CU", continent: "North America" },
	CYPRUS: { polishName: "Cypr", code: "CY", continent: "Europe" },
	"CZECHIA": { polishName: "Czechy", code: "CZ", continent: "Europe" },
	DENMARK: { polishName: "Dania", code: "DK", continent: "Europe" },
	DJIBOUTI: { polishName: "Dżibuti", code: "DJ", continent: "Africa" },
	DOMINICA: { polishName: "Dominika", code: "DM", continent: "North America" },
	"DOMINICAN REPUBLIC": { polishName: "Dominikana", code: "DO", continent: "North America" },
	ECUADOR: { polishName: "Ekwador", code: "EC", continent: "South America" },
	EGYPT: { polishName: "Egipt", code: "EG", continent: "Africa" },
	"EL SALVADOR": { polishName: "Salwador", code: "SV", continent: "North America" },
	ERITREA: { polishName: "Erytrea", code: "ER", continent: "Africa" },
	ESTONIA: { polishName: "Estonia", code: "EE", continent: "Europe" },
	ESWATINI: { polishName: "Eswatini", code: "SZ", continent: "Africa" },
	ETHIOPIA: { polishName: "Etiopia", code: "ET", continent: "Africa" },
	FINLAND: { polishName: "Finlandia", code: "FI", continent: "Europe" },
	FRANCE: { polishName: "Francja", code: "FR", continent: "Europe" },
	GABON: { polishName: "Gabon", code: "GA", continent: "Africa" },
	GAMBIA: { polishName: "Gambia", code: "GM", continent: "Africa" },
	GEORGIA: { polishName: "Gruzja", code: "GE", continent: "Asia" },
	GERMANY: { polishName: "Niemcy", code: "DE", continent: "Europe" },
	GHANA: { polishName: "Ghana", code: "GH", continent: "Africa" },
	GREECE: { polishName: "Grecja", code: "GR", continent: "Europe" },
	GREENLAND: { polishName: "Grenlandia", code: "GL", continent: "North America" },
	GRENADA: { polishName: "Grenada", code: "GD", continent: "North America" },
	GUATEMALA: { polishName: "Gwatemala", code: "GT", continent: "North America" },
	GUINEA: { polishName: "Gwinea", code: "GN", continent: "Africa" },
	"GUINEA BISSAU": { polishName: "Gwinea Bissau", code: "GW", continent: "Africa" },
	GUYANA: { polishName: "Gujana", code: "GY", continent: "South America" },
	HAITI: { polishName: "Haiti", code: "HT", continent: "North America" },
	HONDURAS: { polishName: "Honduras", code: "HN", continent: "North America" },
	HUNGARY: { polishName: "Węgry", code: "HU", continent: "Europe" },
	ICELAND: { polishName: "Islandia", code: "IS", continent: "Europe" },
	INDIA: { polishName: "Indie", code: "IN", continent: "Asia" },
	INDONESIA: { polishName: "Indonezja", code: "ID", continent: "Asia" },
	IRAN: { polishName: "Iran", code: "IR", continent: "Asia" },
	IRAQ: { polishName: "Irak", code: "IQ", continent: "Asia" },
	IRELAND: { polishName: "Irlandia", code: "IE", continent: "Europe" },
	ISRAEL: { polishName: "Izrael", code: "IL", continent: "Asia" },
	ITALY: { polishName: "Włochy", code: "IT", continent: "Europe" },
	JAMAICA: { polishName: "Jamajka", code: "JM", continent: "North America" },
	JAPAN: { polishName: "Japonia", code: "JP", continent: "Asia" },
	JORDAN: { polishName: "Jordania", code: "JO", continent: "Asia" },
	KAZAKHSTAN: { polishName: "Kazachstan", code: "KZ", continent: "Asia" },
	KENYA: { polishName: "Kenia", code: "KE", continent: "Africa" },
	KOREA: { polishName: "Korea Południowa", code: "KR", continent: "Asia" },
	KUWAIT: { polishName: "Kuwejt", code: "KW", continent: "Asia" },
	LATVIA: { polishName: "Łotwa", code: "LV", continent: "Europe" },
	LEBANON: { polishName: "Liban", code: "LB", continent: "Asia" },
	LIBERIA: { polishName: "Liberia", code: "LR", continent: "Africa" },
	LIBYA: { polishName: "Libia", code: "LY", continent: "Africa" },
	LIECHTENSTEIN: { polishName: "Liechtenstein", code: "LI", continent: "Europe" },
	LITHUANIA: { polishName: "Litwa", code: "LT", continent: "Europe" },
	LUXEMBOURG: { polishName: "Luksemburg", code: "LU", continent: "Europe" },
	MADAGASCAR: { polishName: "Madagaskar", code: "MG", continent: "Africa" },
	MALAWI: { polishName: "Malawi", code: "MW", continent: "Africa" },
	MALAYSIA: { polishName: "Malezja", code: "MY", continent: "Asia" },
	MALDIVES: { polishName: "Malediwy", code: "MV", continent: "Asia" },
	MALI: { polishName: "Mali", code: "ML", continent: "Africa" },
	MALTA: { polishName: "Malta", code: "MT", continent: "Europe" },
	MAURITANIA: { polishName: "Mauretania", code: "MR", continent: "Africa" },
	MAURITIUS: { polishName: "Mauritius", code: "MU", continent: "Africa" },
	MEXICO: { polishName: "Meksyk", code: "MX", continent: "North America" },
	MOLDOVA: { polishName: "Mołdawia", code: "MD", continent: "Europe" },
	MONACO: { polishName: "Monako", code: "MC", continent: "Europe" },
	MONGOLIA: { polishName: "Mongolia", code: "MN", continent: "Asia" },
	MONTENEGRO: { polishName: "Czarnogóra", code: "ME", continent: "Europe" },
	MOROCCO: { polishName: "Maroko", code: "MA", continent: "Africa" },
	MOZAMBIQUE: { polishName: "Mozambik", code: "MZ", continent: "Africa" },
	NAMIBIA: { polishName: "Namibia", code: "NA", continent: "Africa" },
	NEPAL: { polishName: "Nepal", code: "NP", continent: "Asia" },
	NETHERLANDS: { polishName: "Holandia", code: "NL", continent: "Europe" },
	"NETHERLANDS ANTILLES": { polishName: "Antyle Holenderskie", code: "AN", continent: "North America" },
	"NEW ZEALAND": { polishName: "Nowa Zelandia", code: "NZ", continent: "Oceania" },
	NICARAGUA: { polishName: "Nikaragua", code: "NI", continent: "North America" },
	NIGER: { polishName: "Niger", code: "NE", continent: "Africa" },
	NIGERIA: { polishName: "Nigeria", code: "NG", continent: "Africa" },
	"NORTH MACEDONIA": { polishName: "Macedonia Północna", code: "MK", continent: "Europe" },
	NORWAY: { polishName: "Norwegia", code: "NO", continent: "Europe" },
	OMAN: { polishName: "Oman", code: "OM", continent: "Asia" },
	PAKISTAN: { polishName: "Pakistan", code: "PK", continent: "Asia" },
	PANAMA: { polishName: "Panama", code: "PA", continent: "North America" },
	PARAGUAY: { polishName: "Paragwaj", code: "PY", continent: "South America" },
	PERU: { polishName: "Peru", code: "PE", continent: "South America" },
	PHILIPPINES: { polishName: "Filipiny", code: "PH", continent: "Asia" },
	POLAND: { polishName: "Polska", code: "PL", continent: "Europe" },
	PORTUGAL: { polishName: "Portugalia", code: "PT", continent: "Europe" },
	"PUERTO RICO": { polishName: "Portoryko ", code: "PR", continent: "South America" },
	QATAR: { polishName: "Katar", code: "QA", continent: "Asia" },
	ROMANIA: { polishName: "Rumunia", code: "RO", continent: "Europe" },
	RUSSIA: { polishName: "Rosja", code: "RU", continent: "Europe" },
	RWANDA: { polishName: "Rwanda", code: "RW", continent: "Africa" },
	"SAINT BARTHÉLEMY": { polishName: "Saint-Barthélemy", code: "BL", continent: "North America" },
	"SAN MARINO": { polishName: "San Marino", code: "SM", continent: "Europe" },
	"SAUDI ARABIA": { polishName: "Arabia Saudyjska", code: "SA", continent: "Asia" },
	SENEGAL: { polishName: "Senegal", code: "SN", continent: "Africa" },
	SERBIA: { polishName: "Serbia", code: "RS", continent: "Europe" },
	SEYCHELLES: { polishName: "Seszele", code: "SC", continent: "Africa" },
	SINGAPORE: { polishName: "Singapur", code: "SG", continent: "Asia" },
	SLOVAKIA: { polishName: "Słowacja", code: "SK", continent: "Europe" },
	SLOVENIA: { polishName: "Słowenia", code: "SI", continent: "Europe" },
	SOMALIA: { polishName: "Somalia", code: "SO", continent: "Africa" },
	"SOUTH AFRICA": { polishName: "Republika Południowej Afryki", code: "ZA", continent: "Africa" },
	"SOUTH KOREA": { polishName: "Korea Południowa", code: "KR", continent: "Asia" },
	SPAIN: { polishName: "Hiszpania", code: "ES", continent: "Europe" },
	SUDAN: { polishName: "Sudan", code: "SD", continent: "Africa" },
	SURINAME: { polishName: "Surinam", code: "SR", continent: "South America" },
	SWEDEN: { polishName: "Szwecja", code: "SE", continent: "Europe" },
	SWITZERLAND: { polishName: "Szwajcaria", code: "CH", continent: "Europe" },
	SYRIA: { polishName: "Syria", code: "SY", continent: "Asia" },
	TAIWAN: { polishName: "Tajwan", code: "TW", continent: "Asia" },
	TAJIKISTAN: { polishName: "Tadżykistan", code: "TJ", continent: "Asia" },
	TANZANIA: { polishName: "Tanzania", code: "TZ", continent: "Africa" },
	THAILAND: { polishName: "Tajlandia", code: "TH", continent: "Asia" },
	TOGO: { polishName: "Togo", code: "TG", continent: "Africa" },
	TUNISIA: { polishName: "Tunezja", code: "TN", continent: "Africa" },
	TURKEY: { polishName: "Turcja", code: "TR", continent: "Asia" },
	TURKMENISTAN: { polishName: "Turkmenistan", code: "TM", continent: "Asia" },
	UGANDA: { polishName: "Uganda", code: "UG", continent: "Africa" },
	UKRAINE: { polishName: "Ukraina", code: "UA", continent: "Europe" },
	USA: { polishName: "Stany Zjednoczone", code: "US", continent: "North America" },
	"UNITED ARAB EMIRATES": { polishName: "Zjednoczone Emiraty Arabskie", code: "AE", continent: "Asia" },
	"GREAT BRITAIN": { polishName: "Wielka Brytania", code: "GB", continent: "Europe" },
};

export const getFlagUrl = (nationality: string) => {
	if (!Object.keys(countries).includes(nationality))
		return "";
	return `https://flagsapi.com/${countries[nationality].code}/flat/64.png`;
};

export const RightTriangle: React.FC<{
	width: number;
	height: number;
	colorTop: string;
	colorBottom: string;
	rotate?: number;
}> = ({ width, height, colorTop, colorBottom, rotate = 0 }) => {
	return (
		<Svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			style={{ transform: [{ rotate: `${rotate}deg` }] }}
		>
			<Defs>
				<LinearGradient id="triangleGradient" x1="0" y1="0" x2="0" y2="1">
					<Stop offset="0%" stopColor={colorTop} />
          			<Stop offset="100%" stopColor={colorBottom} />
				</LinearGradient>
			</Defs>

			<Polygon
				points={`0,0 0,${height} ${width},${height}`}
				fill="url(#triangleGradient)"/>
		</Svg>
	)
} 