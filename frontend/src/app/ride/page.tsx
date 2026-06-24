"use client";
import { DriverIdLatLng } from "@/types/DriverIdLatLng";
import { LatLngObj } from "@/types/LatLngObj";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { autoConnect: false });
const SelectionMapNoSSR = dynamic(() => import("@/components/SelectionMap"), {
	ssr: false,
});

export default function page() {
	const [step, setStep] = useState(1);
	const [pickupCoord, setPickupCoord] = useState<LatLngObj>(null);
	const [destCoord, setDestCoord] = useState<LatLngObj>(null);
	const [userCoord, setUserCoord] = useState<LatLngObj>(null);

	const [drivers, setDrivers] = useState<DriverIdLatLng[]>([]); // to add/remove a marker to map
	const seenDriverIds = useRef<Set<string>>(new Set()); // just to check if seen, otherwise add to driverIds, to prevent `if id in driverIds` O(n)
	const refMap = useRef<Map<string, L.Marker>>(new Map()); // driver ids state -> marker element map

	useEffect(() => {
		// -------------------- GET USER LOCATION ON LOAD -------------------------

		if (typeof window === "undefined" || !navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(pos) =>
				setUserCoord({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				}),
			(err) => alert(err.message),
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000, // accept cached if within this milliseconds old
			},
		);
	}, []);

	async function moveForwardToStep2(pickupCoord: LatLngObj) {
		if (!socket.connected) socket.connect();

		// initial getting of drivers
		const res = await fetch(
			`http://localhost:5000/drivers/nearby?lat=${pickupCoord!.lat}&lng=${pickupCoord!.lng}`,
		);
		const data = await res.json();
		// todo: data.drivers is not an array of ids, but an array of objects
		console.log(data);
		setDrivers(data.drivers);
		seenDriverIds.current = new Set(
			data.drivers.map((d: { driverId: string }) => d.driverId),
		);

		// websocket
		socket.emit("join-frontends");

		socket.on(
			"driver-ping",
			(data: { driverId: string; lat: number; lng: number }) => {
				// todo: frontend filter based on radius because it receives drivers of full region
				console.log("driver-ping from", data);

				if (seenDriverIds.current.has(data.driverId)) {
					const marker = refMap.current.get(data.driverId);

					if (marker) {
						marker.setLatLng([data.lat, data.lng]);
					}
				} else {
					seenDriverIds.current.add(data.driverId);
					setDrivers((prev) => [...prev, data]);
				}
			},
		);

		setStep(2);
		leafletMapRef.current?.setZoom(15);
	}

	function moveForwardToStep3(destCoord: LatLngObj) {
		setStep(3);
	}

	function moveBackToStep1() {
		setStep(1);
		seenDriverIds.current.clear();
		refMap.current.clear();
		setDestCoord(null);
		setDrivers([]);
		socket.emit("leave-frontends");
		socket.off("driver-ping");
	}

	function moveBackToStep2() {
		setStep(2);
	}

	function moveToNextStep(step: number) {
		if (step === 1) {
			if (pickupCoord) {
				moveForwardToStep2(pickupCoord);
			}
		} else if (step === 2) {
			if (destCoord) {
				moveForwardToStep3(destCoord);
			}
		}
	}

	function moveToPrevStep(step: number) {
		if (step === 3) moveBackToStep2();
		else if (step === 2) moveBackToStep1();
	}

	const leafletMapRef = useRef<L.Map | null>(null);

	return (
		<div className="flex flex-wrap justify-center items-center flex-col gap-3 py-8 px-4">
			<h3 className="text-3xl font-bold">
				{step === 1
					? "1. Click on pick-up location"
					: step === 2
						? "2. Click on drop-off location"
						: "3. Waiting... (nothing will happen)"}
			</h3>

			<div className="flex gap-2">
				<button
					className="bg-red-500 text-white px-2 py-1 rounded-md"
					disabled={step === 1}
					onClick={() => moveToPrevStep(step)}
				>
					{step < 3 ? "Back" : "Cancel"}
				</button>

				{step < 3 && (
					<button
						className="bg-blue-500 text-white px-2 py-1 rounded-md"
						disabled={
							step > 3 ||
							(step === 1 && !pickupCoord) ||
							(step === 2 && !destCoord)
						}
						onClick={() => moveToNextStep(step)}
					>
						{step === 1 ? "Next" : "Confirm"}
					</button>
				)}
			</div>

			<div className="w-[100%] h-[500px] rounded-xl overflow-hidden">
				<SelectionMapNoSSR
					step={step}
					userCoord={userCoord} // for map center
					setDestCoord={setDestCoord}
					setPickupCoord={setPickupCoord}
					pickupCoord={pickupCoord}
					destCoord={destCoord}
					refMap={refMap}
					drivers={drivers}
					leafletMapRef={leafletMapRef}
				/>
			</div>
		</div>
	);
}
