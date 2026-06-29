import type { Socket } from "socket.io";
import { io } from "./createIOServer";
import { pubClient } from "./redisClients";

export function attachSocketListeners() {
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
                console.log('driver-ping received');
                
				pubClient.geoAdd("drivers:active", {
					latitude: d.lat,
					longitude: d.lng,
					member: d.driverId,
				});
			},
		);
	});
}
