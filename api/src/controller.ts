import type { Request, Response } from "express";
import * as services from "./services";
import { BoundingBoxSchema, LatLngSchema } from "./schemas";

export function hello(req: Request, res: Response) {
	res.send("Hello");
}

export async function getNearbyDrivers(req: Request, res: Response) {
	try {
		const { lat, lng } = LatLngSchema.parse(req.query);
		const drivers = await services.getNearbyDrivers(lat, lng);
		res.json({ drivers });
	} catch {
		return res.status(400).json({ error: "Provide valid lat and lng" });
	}
}

export async function getDriversInBoundingBox(req: Request, res: Response) {
	try {
		const bbox = BoundingBoxSchema.parse(req.query);
		const drivers = await services.getDriversInBoundingBox(bbox);
		res.json({ drivers });
	} catch (err) {
		console.log(err);
		return res
			.status(400)
			.json({ error: "Provide valid nwlat, nwlng, swlat and swlng" });
	}
}
