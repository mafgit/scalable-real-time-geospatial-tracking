import { io, type Socket } from "socket.io-client";

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

async function simulate({
	numDrivers,
	centerLat,
	centerLng,
	changeInLatOrLng,
}: {
	numDrivers: number;
	centerLat: number;
	centerLng: number;
	changeInLatOrLng: number;
}) {
	console.log(`Simulating ${numDrivers} drivers`);

	drivers = {};
	let driver;
	while (true) {
		for (let d = 0; d < numDrivers; d++) {
			const driverId = "driver-" + d;

			if (!(driverId in drivers)) {
				// creating driver at random locations
				const dx =
					Math.random() * changeInLatOrLng * 2 - changeInLatOrLng;
				const dy =
					Math.random() * changeInLatOrLng * 2 - changeInLatOrLng;

				const newLat = centerLat + dx;
				const newLng = centerLng + dy;

				const socket = io("http://localhost:8080", {
					query: { driverId: driverId },
					forceNew: true,
					multiplex: false,
					transports: ["websocket"],
					reconnection: true,
					reconnectionAttempts: Infinity,
					reconnectionDelay: 1000,
					timeout: 5000,
				});

				socket.on("connect_error", (err) => {
					console.error("Websocket connection error");
				});

				socket.on("disconnect", (reason) => {
					console.log("Socket disconnected", reason);
				});

				drivers[driverId] = {
					lat: newLat,
					lng: newLng,
					socket: socket,
				};

				driver = drivers[driverId];
			} else {
				// moving existing driver randomly
				driver = drivers[driverId];
				const dx = Math.random() * 0.00001 * 2 - 0.0001;
				const dy = Math.random() * 0.00001 * 2 - 0.0001;

				const newLat = driver.lat + (Math.random() < 0.5 ? -1 : 1) * dx;
				const newLng = driver.lng + (Math.random() < 0.5 ? -1 : 1) * dy;
				driver.lat = newLat;
				driver.lng = newLng;
			}

			// emitting ping to ws-ingestion service
			if (driver.socket.connected) {
				driver.socket.emit("driver-ping", {
					driverId: driverId,
					lat: drivers[driverId].lat,
					lng: drivers[driverId].lng,
				});
			}
		}

		await delay(Math.random() * 2000);
	}
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// function clamp(x: number, min: number, max: number) {
// 	return Math.min(Math.max(x, max), min);
// }

simulate({
	numDrivers: 50,
	centerLat: 24.926,
	centerLng: 67.1371,
	changeInLatOrLng: 0.1,
});
