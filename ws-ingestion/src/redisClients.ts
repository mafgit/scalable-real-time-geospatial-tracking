import { createClient } from "redis";
import { io } from "./createIOServer";
import { createAdapter } from "@socket.io/redis-adapter";

export const pubClient = createClient({ url: process.env.REDIS_URL });
export const subClient = pubClient.duplicate();

export async function createRedisPubSubClients() {
	await Promise.all([pubClient.connect(), subClient.connect()]);

	console.log("Redis pub/sub clients created");

	io.adapter(createAdapter(pubClient, subClient));

	console.log("Socket.io server connected to Redis via adapter");
}
