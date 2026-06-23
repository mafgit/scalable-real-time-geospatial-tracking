"use client";
import { type LatLngObj } from "@/components/SelectionMap";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", { autoConnect: false });
const SelectionMapNoSSR = dynamic(() => import("@/components/SelectionMap"), {
	ssr: false,
});

export default function page() {
	const [step, setStep] = useState(1);
	const [pickupCoord, setPickupCoord] = useState<LatLngObj>(null);
	const [destCoord, setDestCoord] = useState<LatLngObj>(null);
	const [userCoord, setUserCoord] = useState<LatLngObj>(null);

	const [deviceIds, setDeviceIds] = useState<string[]>([]); // to add/remove a marker to map
	const seenDeviceIds = useRef<Set<string>>(new Set()); // just to check if seen, otherwise add to deviceIds, to prevent `if id in deviceIds` O(n)
	const refMap = useRef<Map<string, L.Marker>>(new Map()); // device ids state -> marker element map

	// useEffect(() => {
	// 	if (!socket.connected) socket.connect();

	// 	socket.on(
	// 		"driver-ping",
	// 		(data: { deviceId: string; lat: number; lng: number }) => {
	// 			console.log("driver-ping from", data);

	// 			if (seenDeviceIds.current.has(data.deviceId)) {
	// 				const marker = refMap.current.get(data.deviceId);

	// 				if (marker) {
	// 					marker.setLatLng([data.lat, data.lng]);
	// 				}
	// 			} else {
	// 				seenDeviceIds.current.add(data.deviceId);
	// 				setDeviceIds((prev) => [...prev, data.deviceId]);
	// 			}
	// 		},
	// 	);

	// 	return () => {
	// 		socket.off("driver-ping");
	// 	};
	// }, []);

	useEffect(() => {
		if (typeof window === "undefined" || !navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(pos) =>
				setUserCoord({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				}),
			(err) => alert(err.message),
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
		);
	}, []);

	return (
		<div className="">
			<h3>
				{step === 1
					? "Select your pickup point on the map"
					: step === 2
						? "Select your destination on the map"
						: "Showing active drivers"}
			</h3>

			{step < 3 ? (
				<>
					<button
						disabled={step === 1}
						onClick={() =>
							setStep((s) => {
								return s > 1 ? s - 1 : s;
							})
						}
					>
						Back
					</button>

					<button
						disabled={
							step > 3 ||
							(step === 1 && !pickupCoord) ||
							(step === 2 && !destCoord)
						}
						onClick={() =>
							setStep((s) => {
								if (
									(s === 1 && pickupCoord) ||
									(s === 2 && destCoord && pickupCoord)
								)
									return s + 1;
								return s;
							})
						}
					>
						{step === 1 ? "Next" : "Confirm"}
					</button>
				</>
			) : (
				<button
					onClick={() =>
						setStep((s) => {
							return s > 1 ? s - 1 : s;
						})
					}
				>
					Cancel
				</button>
			)}

			<div className="w-[300px] h-[300px] bg-black">
				<SelectionMapNoSSR
					step={step}
					userCoord={userCoord} // for map center
					setDestCoord={setDestCoord}
					setPickupCoord={setPickupCoord}
					pickupCoord={pickupCoord}
					destCoord={destCoord}
				/>
			</div>
		</div>
	);
}
