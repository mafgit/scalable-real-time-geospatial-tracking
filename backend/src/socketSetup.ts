import { Server, Socket } from "socket.io";
import type http from "node:http";

export default function socketSetup(httpServer: http.Server) {
	const io = new Server(httpServer, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket: Socket) => {
		// console.log(`Socket ${socket.id} connected`);

		// frontend -> backend
		socket.on("join-frontends", () => {
			socket.join("frontends");
		});

		// frontend -> backend
		socket.on("leave-frontends", () => {
			socket.leave("frontends");
		});

		// driver driver ping -> backend: backend broadcasts to room of the region
		socket.on(
			"driver-ping",
			(data: { driverId: string; lat: number; lng: number }) => {
				io.to("frontends").emit("driver-ping", {
					driverId: data.driverId,
					lat: data.lat,
					lng: data.lng,
				});
			},
		);
	});
}
