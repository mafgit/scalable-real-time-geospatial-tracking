import { Server } from "socket.io";

export const io = new Server({
	cors: {
		origin: "*",
	},
	transports: ["websocket"], // to disallow long polling for better efficiency,
	allowUpgrades: false, // raw ws connection immediately
	pingInterval: 10000, // every 10 secs, ws sends a ping to driver device and asks for pong within 5 secs otherwise offline
	pingTimeout: 5000,
});
