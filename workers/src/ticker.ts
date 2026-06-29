import { redisClient } from "./redisClient";

const regions = [{ id: "global", latitude: 0, longitude: 0, radiusKm: 20000 }];

export default function ticker() {
	console.log("Worker has started");

	setInterval(async () => {
		const promises = [];
		for (const region of regions) {
			promises.push(
				redisClient.geoSearchWith(
					"drivers:active",
					{ latitude: region.latitude, longitude: region.longitude },
					{ radius: region.radiusKm, unit: "km" },
					["WITHCOORD"],
				),
			);
		}

		const regionDriversArray = await Promise.all(promises);
		const regionDrivers: Record<
			string,
			{
				member: string;
				coordinates: { latitude: number; longitude: number };
			}[]
		> = {};

		regionDriversArray.forEach((drivers, i) => {
			if (drivers) regionDrivers[regions[i].id] = drivers;
		});

		const payload = { timestamp: Date.now(), regionDrivers };

		console.log(payload["regionDrivers"]["global"]);
		redisClient.publish("channel:batch_pings", JSON.stringify(payload));
	}, 2000);
}
