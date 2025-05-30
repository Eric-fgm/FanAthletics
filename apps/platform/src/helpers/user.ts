export const shouldBeOnboarded = (user: Record<string, unknown>) => {
	return !("note" in user) || !user.note;
};

export const isAdmin = (user?: Record<string, unknown>) => {
	return user && user.role === "admin";
};
