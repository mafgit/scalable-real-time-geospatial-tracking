import { LatLngObj } from "@/types/LatLngObj";
import { create } from "zustand";
import socketManager from "@/managers/socketManager";
import mapManager from "@/managers/mapManager";
import {
	fetchDriversInBoundingBox,
	fetchNearbyDrivers,
} from "@/utils/mapUtils";
import { StateStoreType } from "@/types/StateStoreType";
import { DriverPing } from "@/types/DriverPing";

export const useStateStore = create<StateStoreType>((set, get) => ({
	step: 1,
	pickupCoord: null,
	destCoord: null,
	userCoord: null,
	view: "RIDE",
	drivers: [],

	// actions
	setDestCoord: (c: LatLngObj | null) => set({ destCoord: c }),
	setPickupCoord: (c: LatLngObj | null) => set({ pickupCoord: c }),
	setUserCoord: (c: LatLngObj | null) => set({ userCoord: c }),
	setDrivers: (drivers: DriverPing[]) => set({ drivers }),

	changeViewToGlobal: async () => {
		const { view } = get();
		if (view === "GLOBAL") return;

		if (mapManager.leafletMap && typeof window !== "undefined") {
			try {
				mapManager.seenDriverIds.clear();

				const { centerLat, centerLng, widthKm, heightKm } =
					mapManager.getScreenBoundingBox();

				const data = await fetchDriversInBoundingBox({
					centerLat,
					centerLng,
					widthKm,
					heightKm,
				});

				const driverIds: string[] = [];

				const drivers = data.drivers.map((d) => {
					driverIds.push(d.member);

					return {
						member: d.member,
						latitude: d.coordinates.latitude,
						longitude: d.coordinates.longitude,
					};
				});

				mapManager.seenDriverIds = new Set(driverIds);

				set({ view: "GLOBAL", drivers });

				socketManager.attachDriverPingBatchListener("GLOBAL");
			} catch {
				alert("There was an error");
			}
		}
	},

	moveForwardToStep2: async (pickupCoord: LatLngObj) => {
		// initial getting of in-radius drivers
		try {
			const data = await fetchNearbyDrivers(pickupCoord);

			const driverIds: string[] = [];

			const drivers = data.drivers.map((d) => {
				driverIds.push(d.member);

				return {
					member: d.member,
					latitude: d.coordinates.latitude, // todo: coordinates is optional in api interface, although redis isnt saving any driver without coordinates?
					longitude: d.coordinates.longitude,
				};
			});

			mapManager.seenDriverIds = new Set(Object.keys(data.drivers));

			set({ drivers, step: 2 });

			socketManager.attachDriverPingBatchListener("RIDE");

			mapManager.leafletMap?.setZoom(15);
		} catch (e) {
			console.error(e);
			alert("Backend service might be down");
		}
	},

	changeViewToRide: () => {
		const { view, clearSteps } = get();
		if (view === "RIDE") return;
		clearSteps();
		set({ view: "RIDE" });
	},

	clearSteps: () => {
		set({ step: 1, pickupCoord: null, destCoord: null });
	},

	moveForwardToStep3: (destCoord: LatLngObj) => {
		set({ step: 3 });
	},

	moveBackToStep1: () => {
		set({
			step: 1,
			destCoord: null,
			drivers: [],
		});
		mapManager.seenDriverIds.clear();
		socketManager.socket.emit("leave-frontend-regions", "GLOBAL");
		socketManager.socket.off("driver-ping");
	},

	moveToNextStep: () => {
		const step = get().step;
		const pickupCoord = get().pickupCoord;
		const destCoord = get().destCoord;
		if (step === 1) {
			if (pickupCoord) {
				get().moveForwardToStep2(pickupCoord);
			}
		} else if (step === 2) {
			if (destCoord) {
				get().moveForwardToStep3(destCoord);
			}
		}
	},

	moveBackToStep2: () => {
		set({ step: 2 });
	},

	moveToPrevStep: () => {
		const step = get().step;
		if (step === 3) get().moveBackToStep2();
		else if (step === 2) get().moveBackToStep1();
	},
}));
