import { io, type Socket } from "socket.io-client";

// const socket = socket.on("connect", () => {
// 	console.log("Driver simulator connected to backend websocket");
// });

// socket.on("disconnect", () => {
// 	console.log("Driver simulator disconnected from backend websocket");
// });

let drivers: Record<
	string,
	{
		lat: number;
		lng: number;
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

async function simulate(
	numDrivers: number,
	centerLat: number,
	centerLng: number,
	r: number,
) {
	console.log(`Simulating ${numDrivers} drivers`);

	drivers = {};
	let driver;
	while (true) {
		for (let d = 0; d < numDrivers; d++) {
			const driverId = "driver-" + d;

			if (!(driverId in drivers)) {
				const dx = Math.random() * r * 2 - r;
				const dy = Math.random() * r * 2 - r;

				const newLat = centerLat + dx;
				const newLng = centerLng + dy;

				const socket = io("http://localhost:8080", {
					query: { driverId: driverId },
					forceNew: true,
					multiplex: false,
                    transports:['websocket']
				});

				socket.on("error", (err) => {
					console.error(err);
				});

				drivers[driverId] = {
					lat: newLat,
					lng: newLng,
					socket: socket,
				};

				driver = drivers[driverId];
			} else {
				driver = drivers[driverId];
				const dx = Math.random() * 0.00001 * 2 - 0.0001;
				const dy = Math.random() * 0.00001 * 2 - 0.0001;

				const newLat = driver.lat + (Math.random() < 0.5 ? -1 : 1) * dx;
				const newLng = driver.lng + (Math.random() < 0.5 ? -1 : 1) * dy;
				driver.lat = newLat;
				driver.lng = newLng;
			}

			driver.socket.emit("driver-ping", {
				driverId: driverId,
				lat: drivers[driverId].lat,
				lng: drivers[driverId].lng,
			});
		}

		await delay(Math.random() * 2000);
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(x: number, min: number, max: number) {
	return Math.min(Math.max(x, max), min);
}

simulate(50, 24.926, 67.1371, 0.1);
