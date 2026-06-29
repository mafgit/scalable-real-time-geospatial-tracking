import { io } from "./createIOServer";
import { subClient } from "./redisClients";

export function attachChannelSubscriptions() {
	subClient.subscribe("channel:batch_pings", handleBatchPings);
}

function handleBatchPings(msg: string) {
	try {
        console.log('Batch pings channel message received')
		const payload = JSON.parse(msg);
		io.to("frontends").emit(payload);
	} catch (err) {
		console.error(err);
	}
}
