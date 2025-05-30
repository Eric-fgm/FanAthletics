import { Hono } from "hono";

export default new Hono().get("/", (c) => {
	return c.json([
		{
			id: "1",
			name: "Diamentowa Liga",
			organization: "European Athletics",
			image:
				"https://img.olympics.com/images/image/private/t_13-5_1560-600/f_auto/v1538355600/primary/mk0vuxgrzgr7e8itpj5i",
			icon: "https://img.olympics.com/images/image/private/t_s_fog_logo_m/f_auto/primary/w993kgqcncimz5gw0uza",
			startAt: new Date(),
			endAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);
});
