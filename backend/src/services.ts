export const drivers: {
	lat: number;
	lng: number;
	driverId: string;
	timestamp: number;
}[] = [];

export async function getNearbyDrivers(
	lat: number,
	lng: number,
): Promise<{ driverId: string; lat: number; lng: number }[]> {
	return drivers;
}
