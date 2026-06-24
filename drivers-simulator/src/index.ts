import { io, type Socket } from "socket.io-client";

// const socket = socket.on("connect", () => {
// 	console.log("Driver simulator connected to backend websocket");
// });

// socket.on("disconnect", () => {
// 	console.log("Driver simulator disconnected from backend websocket");
// });

const validRegions = {
	karachi: { lat: 24.861, lng: 66.9905 },
	lahore: { lat: 31.582, lng: 74.3294 },
};
const validRegionIds = Object.keys(validRegions);
const numValidRegions = validRegionIds.length;

let drivers: Record<
	string,
	{
		lat: number;
		lng: number;
		regionId: keyof typeof validRegions;
		socket: Socket;
	}
>;

process.on("SIGINT", () => {
	console.log("Keyboard interrupt detected");

	Object.values(drivers).forEach((d) => {
		if (d.socket.connected) d.socket.disconnect();
	});

	process.exit(0);
});

async function simulate(numDrivers: number, seconds: number) {
	console.log(`Simulating ${numDrivers} drivers`);

	drivers = {};

	let driver;
	for (let t = 0; t < seconds; t++) {
		if ((t + 1) % 5 === 0) console.log(`\nStep ${t + 1}/${seconds}`);

		for (let d = 0; d < numDrivers; d++) {
			const driverId = "driver-" + d;

			if (!(driverId in drivers)) {
				const dx = Math.random() * 0.3 - 0.15; // -0.15 to 0.15
				const dy = Math.random() * 0.3 - 0.15;
				const { regionId, lat, lng } = getRandomRegionAndCenter();
				const newLat = lat + dx;
				const newLng = lng + dy;

				drivers[driverId] = {
					lat: newLat,
					lng: newLng,
					regionId: regionId,
					socket: io("http://localhost:5000", {
						query: { driverId: driverId },
						forceNew: true,
						multiplex: false,
					}),
				};

				driver = drivers[driverId];
				// console.log(driver.regionId);
			} else {
				driver = drivers[driverId];
				const dx = Math.random() * (0.00013 - 0.0001) + 0.0001;
				const dy = Math.random() * (0.00013 - 0.0001) + 0.0001;

				const newLat = driver.lat + (Math.random() < 0.5 ? -1 : 1) * dx;
				const newLng = driver.lng + (Math.random() < 0.5 ? -1 : 1) * dx;
				driver.lat = newLat;
				driver.lng = newLng;
			}

			driver.socket.emit("driver-ping", {
				driverId: driverId,
				regionId: drivers[driverId].regionId,
				lat: drivers[driverId].lat,
				lng: drivers[driverId].lng,
			});
		}

		await delay(Math.random() * 2000);
	}

	Object.values(drivers).forEach((d) => {
		if (d.socket.connected) d.socket.disconnect();
	});
}

function getRandomRegionAndCenter() {
	const regionId = validRegionIds[
		Math.floor(Math.random() * numValidRegions)
	] as keyof typeof validRegions;
	const { lat, lng } = validRegions[regionId];
	return { regionId, lat, lng };
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(x: number, min: number, max: number) {
	return Math.min(Math.max(x, max), min);
}

simulate(5, 100);
