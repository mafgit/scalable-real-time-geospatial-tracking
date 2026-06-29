import { createClient } from "redis";

export const redisClient = createClient({ url: "redis://localhost:6379/" });

export async function initRedis() {
	redisClient.on("error", (err) => console.error(err));
	await redisClient.connect();
	console.log("Connected to Redis");
}
