import { initRedis } from "./redisClient";
import ticker from "./ticker";
import 'dotenv/config'

main();

async function main() {
	await initRedis();
	ticker();
}
