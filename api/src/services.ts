import { RADIUS } from "./constants";
import { redisClient } from "./redisClient";
import { BoundingBoxType } from "./schemas";

export async function getNearbyDrivers(latitude: number, longitude: number) {
	const drivers = await redisClient.geoSearchWith(
		"drivers:active",
		{ latitude, longitude },
		{ radius: RADIUS, unit: "m" },
		["WITHCOORD"],
	);

	return drivers;
}

export async function getDriversInBoundingBox({
	centerlat,
	centerlng,
	widthkm,
	heightkm,
}: BoundingBoxType) {
	const drivers = await redisClient.geoSearchWith(
		"drivers:active",
		{ latitude: centerlat, longitude: centerlng },
		{ width: widthkm, height: heightkm, unit: "km" },
		["WITHCOORD"],
	);
    
	return drivers;
}
