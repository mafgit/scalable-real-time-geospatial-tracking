import type { Socket } from "socket.io";
import { io } from "./createIOServer";

export function attachListeners() {
	io.on("connection", (socket: Socket) => {
		// console.log(`Socket ${socket.id} connected`);

		// frontend -> backend
		socket.on("join-frontends", () => {
			socket.join("frontends");
		});

		socket.on("leave-frontends", () => {
			socket.leave("frontends");
		});

		// driver ping -> ws: ws publishes to redis channel for worker
		socket.on(
			"driver-ping",
			(d: { driverId: string; lat: number; lng: number }) => {
				const updated = {
					lat: d.lat,
					lng: d.lng,
					timestamp: Date.now(),
				};
				// io.to("frontends").emit("driver-ping", {
				// 	driverId: d.driverId,
				// 	lat: d.lat,
				// 	lng: d.lng,
				// });
			},
		);
	});
}
