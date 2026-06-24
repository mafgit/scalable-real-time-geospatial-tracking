import type { Request, Response } from "express";
import * as services from "./services.js";

export function hello(req: Request, res: Response) {
	res.send("Hello");
}

export async function getNearbyDrivers(req: Request, res: Response) {
	const { lat, lng } = req.query;

	if (typeof lat !== "number" || typeof lng !== "number") {
		return res.status(400).json({ error: "Provide valid lat and lng" });
	}

	const drivers = await services.getNearbyDrivers(lat, lng);
	res.json({ drivers });
}
