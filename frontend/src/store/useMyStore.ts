import { DriverIdLatLng } from "@/types/DriverIdLatLng";
import { LatLngObj } from "@/types/LatLngObj";
import { ViewType } from "@/types/ViewType";
import { create } from "zustand";
import { io, type Socket } from "socket.io-client";

interface MyStoreType {
	pickupCoord: LatLngObj | null;
	userCoord: LatLngObj | null;
	destCoord: LatLngObj | null;
	view: ViewType;
	drivers: DriverIdLatLng[]; // to add/remove a marker to map
	step: number;

	// non-reactive (because we won't use set({ ... }) to update them)
	_seenDriverIds: { current: Set<string> };
	_refMap: { current: Map<string, L.Marker> };
	_leafletMapRef: { current: L.Map | null };
	_socket: { current: Socket };

	// actions
	setUserCoord: (c: LatLngObj | null) => void;
	setPickupCoord: (c: LatLngObj | null) => void;
	setDestCoord: (c: LatLngObj | null) => void;
	changeViewToGlobal: () => void;
	changeViewToRide: () => void;
	requestUserCoord: () => void;
	moveBackToStep1: () => void;
	moveForwardToStep2: (pickupCoord: LatLngObj) => void;
	moveForwardToStep3: (pickupCoord: LatLngObj) => void;
	moveToNextStep: () => void;
	moveBackToStep2: () => void;
	moveToPrevStep: () => void;
}

export const useMyStore = create<MyStoreType>((set, get) => ({
	step: 1,
	pickupCoord: null,
	destCoord: null,
	userCoord: null,
	view: "ride",
	drivers: [],

	_socket: { current: io("http://localhost:5000", { autoConnect: false }) },
	_refMap: { current: new Map() },
	_leafletMapRef: { current: null },
	_seenDriverIds: { current: new Set() },

	// actions
	setUserCoord: (c: LatLngObj | null) => set({ userCoord: c }),
	setDestCoord: (c: LatLngObj | null) => set({ destCoord: c }),
	setPickupCoord: (c: LatLngObj | null) => set({ pickupCoord: c }),
	// setView: (v: ViewType) => set({ view: v }),
	changeViewToGlobal: () => {
		const view = get().view;
		if (view === "global") return;
		set({ view: "global" });
	},
	changeViewToRide: () => {
		const view = get().view;
		if (view === "ride") return;
		set({ view: "ride" });
	},
	requestUserCoord: () => {
		if (typeof window === "undefined" || !navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(pos) =>
				set({
					userCoord: {
						lat: pos.coords.latitude,
						lng: pos.coords.longitude,
					},
				}),
			(err) => alert(err.message),
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000, // accept cached if within this milliseconds old
			},
		);
	},
	moveForwardToStep2: async (pickupCoord: LatLngObj) => {
		const { _seenDriverIds, _socket, _refMap, _leafletMapRef, drivers } =
			get();
		if (!_socket.current.connected) _socket.current.connect();

		// initial getting of drivers
		try {
			const res = await fetch(
				`http://localhost:5000/drivers/nearby?lat=${pickupCoord!.lat}&lng=${pickupCoord!.lng}`,
			);
			const data = await res.json();
			console.log(data);
			set({
				drivers: Object.entries(data.drivers).map((x) => ({
					...(x[1] as LatLngObj),
					driverId: x[0],
				})),
			});
			_seenDriverIds.current = new Set(Object.keys(data.drivers));

			// web_socket
			_socket.current.emit("join-frontends");

			_socket.current.on(
				"driver-ping-batch",
				(batch: Record<string, LatLngObj>, expired: string[]) => {
					// todo: frontend filter based on radius because it receives drivers of full region
					console.log("Received driver-ping-batch");

					let oldDrivers = [...drivers]; // copy
					let changeState = false; // just a flag whether to call setDrivers([]) to avoid setting state again if not changed

					if (expired) {
						const expiredSet = new Set(expired);
						oldDrivers = oldDrivers.filter((d) => {
							if (!expiredSet.has(d.driverId)) {
								return true;
							} else {
								changeState = true;
								return false;
							}
						});
					}

					for (const key in batch) {
						if (_seenDriverIds.current.has(key)) {
							const marker = _refMap.current.get(key);

							if (marker) {
								marker.setLatLng([
									batch[key].lat,
									batch[key].lng,
								]);
							}
						} else {
							_seenDriverIds.current.add(key);
							oldDrivers.push({ ...batch[key], driverId: key });
							changeState = true;
						}
					}

					if (changeState) set({ drivers: oldDrivers });
				},
			);

			set({ step: 2 });
			_leafletMapRef.current?.setZoom(15);
		} catch {
			alert("Backend service might be down");
		}
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
		const { _seenDriverIds, _refMap, _socket } = get();
		_seenDriverIds.current.clear();
		_refMap.current.clear();
		_socket.current.emit("leave-frontends");
		_socket.current.off("driver-ping");
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
