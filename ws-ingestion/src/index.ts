import { initRedisPubSubClients, pubClient, subClient } from "./redisClients";
import { io } from "./createIOServer";
import { attachSocketListeners } from "./attachSocketListeners";
import { createAdapter } from "@socket.io/redis-adapter";
import { attachChannelSubscriptions } from "./attachChannelSubscriptions";

main();

async function main() {
	await initRedisPubSubClients();

	io.adapter(createAdapter(pubClient, subClient));
	
    attachChannelSubscriptions()

    attachSocketListeners();
	
    io.listen(8080);
}
