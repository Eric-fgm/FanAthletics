/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			fontSize: {
				md: "15px",
			},
		},
	},
	presets: [require("nativewind/preset")],
	plugins: [],
};
