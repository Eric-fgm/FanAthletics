import { create } from "zustand";

interface LayoutState {
	insets: Record<"top" | "bottom" | "right" | "left", number>;
	setInsets: (insets: Partial<LayoutState["insets"]>) => void;
}

const useLayoutStore = create<LayoutState>((set) => ({
	insets: {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	},
	setInsets: (insets) =>
		set((state) => ({ ...state, insets: { ...state.insets, ...insets } })),
}));

export default useLayoutStore;
