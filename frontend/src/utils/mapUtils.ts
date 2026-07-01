import { LatLngObj } from "@/types/LatLngObj";

type RedisDriversType = Promise<{
	drivers: {
		member: string;
		coordinates: { latitude: number; longitude: number };
	}[];
}>;

export async function fetchDriversInBoundingBox({
	centerLat,
	centerLng,
	widthKm,
	heightKm,
}: {
	centerLat: number;
	centerLng: number;
	widthKm: number;
	heightKm: number;
}): RedisDriversType {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_SERVICE_URL}/drivers/bounding-box?centerlat=${centerLat}&centerlng=${centerLng}&widthkm=${widthKm}&heightkm=${heightKm}`,
	);
	const data = await res.json();

	return data;
}

export async function fetchNearbyDrivers(
	pickupCoord: LatLngObj,
): RedisDriversType {
	const res = await fetch(
		`${process.env.API_SERVICE_URL}/drivers/nearby?lat=${pickupCoord.lat}&lng=${pickupCoord.lng}`,
	);
	const data = await res.json();

	return data;
}
