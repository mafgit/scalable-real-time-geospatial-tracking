import type { Request, Response } from "express";
import * as services from "./services.js";
import { z } from "zod";

export function hello(req: Request, res: Response) {
	res.send("Hello");
}

const LatLngSchema = z.object({
	lat: z.preprocess((x) => (x === "" ? undefined : x), z.coerce.number()),
	lng: z.preprocess((x) => (x === "" ? undefined : x), z.coerce.number()),
});

export async function getNearbyDrivers(req: Request, res: Response) {
	try {
		const { lat, lng } = LatLngSchema.parse(req.query);
		const drivers = await services.getNearbyDrivers(lat, lng);
		res.json({ drivers });
	} catch {
		return res.status(400).json({ error: "Provide valid lat and lng" });
	}
}
