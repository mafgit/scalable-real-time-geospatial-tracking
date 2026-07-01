import { useStateStore } from "@/store/useStateStore";
import { DriverPing } from "@/types/DriverPing";
import { ViewType } from "@/types/ViewType";
import { io } from "socket.io-client";
import mapManager from "./mapManager";

const socketManager = {
	socket: io("http://localhost:8080", {
		autoConnect: false,
		transports: ["websocket"],
	}),

	regionsJoined: [],

	connectIfNotConnected() {
		if (!socketManager.socket.connected) socketManager.socket.connect();
	},

	leaveAndJoinRooms: (regionsToJoin: string[]) => {
		// diffing between already joined and to join
		const regionsJoinedSet = new Set<string>(socketManager.regionsJoined);

		const regionsToJoinSet = new Set(regionsToJoin);

		const roomsToLeave: string[] = [];
		const roomsToJoin: string[] = [];

		regionsJoinedSet.forEach((r) => {
			if (!regionsToJoinSet.has(r)) {
				roomsToLeave.push(r);
			}
		});

		regionsToJoinSet.forEach((r) => {
			if (!regionsJoinedSet.has(r)) {
				roomsToJoin.push(r);
			}
		});

		socketManager.socket.emit("leave-frontend-regions", roomsToLeave);
		socketManager.socket.emit("join-frontend-regions", roomsToJoin);
	},

	attachDriverPingBatchListener(view: ViewType) {
		socketManager.connectIfNotConnected();
		socketManager.socket.off("driver-ping-batch");

		const state = useStateStore.getState();

		if (view === "RIDE") {
			const { pickupCoord } = state;
			if (!pickupCoord) return;

			const roomsToJoin =
				mapManager.getRoomsAroundPickupCoord(pickupCoord);
			socketManager.leaveAndJoinRooms(roomsToJoin);
		} else {
			const roomsToJoin = mapManager.getRoomsInScreenBoundingBox();
			socketManager.leaveAndJoinRooms(roomsToJoin);
		}

		socketManager.socket.on(
			"driver-ping-batch",
			(driverPingBatch: DriverPing[]) => {
				const newDrivers: DriverPing[] = [
					...useStateStore.getState().drivers,
				];

				const { seenDriverIds, memberToMarkerRefMap } = mapManager;

				let driversChanged = false;
				for (const driver of driverPingBatch) {
					if (seenDriverIds.has(driver.member)) {
						const marketElement = memberToMarkerRefMap.get(
							driver.member,
						);
						if (marketElement) {
							marketElement.setLatLng({
								lat: driver.latitude,
								lng: driver.longitude,
							});
						}
					} else {
						seenDriverIds.add(driver.member);
						newDrivers.push(driver);
						driversChanged = true;
					}
				}

				if (driversChanged) {
					state.setDrivers(newDrivers);
				}
			},
		);
	},
};

export default socketManager;
