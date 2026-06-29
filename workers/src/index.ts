import { initRedis } from "./redisClient";
import ticker from "./ticker";

main();

async function main() {
	await initRedis();
	ticker();
}
