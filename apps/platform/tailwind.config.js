/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontSize: {
				md: "15px",
				"4.5xl": "42px",
			},
			boxShadow: {
				smooth: {
					ios: {
						shadowColor: "rgba(0,0,0,0.4)",
						shadowOpacity: 0.1,
						shadowOffset: { width: 0, height: 8 },
						shadowRadius: 16,
					},
				},
				common: "4px 4px 4px rgba(0,0,0,0.25)", // ewentualnie blur na 10px
			},
		},
	},
	presets: [require("nativewind/preset")],
	plugins: [],
};
