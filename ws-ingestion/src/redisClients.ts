import { createClient } from "redis";

export const pubClient = createClient({ url: "redis://localhost:6379/" });
export const subClient = pubClient.duplicate();

export async function initRedisPubSubClients() {
	await Promise.all([pubClient.connect(), subClient.connect()]);
	console.log("Redis pub & sub clients ready");
}
