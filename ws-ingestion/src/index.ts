import { initRedisPubSubClients, pubClient, subClient } from "./redisClients";
import { io } from "./createIOServer";
import { attachListeners } from "./attachListeners";
import { createAdapter } from "@socket.io/redis-adapter";

main();

async function main() {
	await initRedisPubSubClients();
	io.adapter(createAdapter(pubClient, subClient));
	io.listen(8080);
	attachListeners();
}
