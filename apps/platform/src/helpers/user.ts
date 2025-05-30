import type { User } from "@fan-athletics/shared/types";

export const shouldBeOnboarded = (user: User) => {
	return !("note" in user) || !user.note;
};

export const isAdmin = (user: User) => {
	return user && user.role === "admin";
};
