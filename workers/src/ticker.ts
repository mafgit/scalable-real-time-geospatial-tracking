import { redisClient } from "./redisClient";

export default function ticker() {
	console.log("Worker has started");

	setInterval(() => {
        redisClient.publish()
	}, 1000);
}
