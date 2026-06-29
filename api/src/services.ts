import { radius } from "./constants";
import { redisClient } from "./redisClient";
import { BoundingBoxType } from "./schemas";

export async function getNearbyDrivers(latitude: number, longitude: number) {
	const data = await redisClient.geoSearchWith(
		"drivers:active",
		{ latitude, longitude },
		{ radius: radius, unit: "m" },
		["WITHCOORD"],
	);
	return data;
}

export async function getDriversInBoundingBox({
	centerlat,
	centerlng,
	widthm,
	heightm,
}: BoundingBoxType) {
	const data = await redisClient.geoSearchWith(
		"drivers:active",
		{ latitude: centerlat, longitude: centerlng },
		{ width: widthm, height: heightm, unit: "m" },
		["WITHCOORD"],
	);
	return data;
}
