import { createClient } from "redis";

export const redisClient = createClient({ url: process.env.REDIS_URL });

export async function initRedis() {
	redisClient.on("error", (err) => console.error(err));
	await redisClient.connect();
	console.log("Connected to Redis");
}
