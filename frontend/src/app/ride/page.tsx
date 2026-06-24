"use client";
import { type LatLngObj } from "@/components/SelectionMap";
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

	const [driverIds, setDriverIds] = useState<string[]>([]); // to add/remove a marker to map
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
		setDriverIds(data.drivers);
		seenDriverIds.current = new Set(data.drivers);

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
					setDriverIds((prev) => [...prev, data.driverId]);
				}
			},
		);
	}

    function moveForwardToStep3(destCoord: LatLngObj) {
        setStep(3);
    }
	
    function moveBackToStep1() {
		setStep(1);
		seenDriverIds.current.clear();
		refMap.current.clear();
		setDestCoord(null);
		setDriverIds([]);
		socket.emit("leave-frontends");
		socket.off("driver-ping");
	}


	function moveBackToStep2() {
		setStep(2);
		setDestCoord(null);
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

	return (
		<div className="">
			<h3>
				{step === 1
					? "Select your pickup point on the map"
					: step === 2
						? "Select your destination on the map"
						: "Waiting... (nothing will happen)"}
			</h3>

			<>
				<button
					disabled={step === 1}
					onClick={() => moveToPrevStep(step)}
				>
					{step < 3 ? "Back" : "Cancel"}
				</button>

				<button
					disabled={
						step > 3 ||
						(step === 1 && !pickupCoord) ||
						(step === 2 && !destCoord)
					}
					onClick={() => moveToNextStep(step)}
				>
					{step === 1 ? "Next" : "Confirm"}
				</button>
			</>

			<div className="w-[300px] h-[300px] bg-black">
				<SelectionMapNoSSR
					step={step}
					userCoord={userCoord} // for map center
					setDestCoord={setDestCoord}
					setPickupCoord={setPickupCoord}
					pickupCoord={pickupCoord}
					destCoord={destCoord}
					refMap={refMap}
					driverIds={driverIds}
				/>
			</div>
		</div>
	);
}
