"use client";
import RideSteps from "@/components/RideSteps";
import RidePageTop from "@/components/RidePageTop";
import { DriverIdLatLng } from "@/types/DriverIdLatLng";
import { LatLngObj } from "@/types/LatLngObj";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ViewType } from "@/types/ViewType";

const SelectionMapNoSSR = dynamic(() => import("@/components/SelectionMap"), {
	ssr: false,
});

export default function page() {
	const [step, setStep] = useState(1);
	const [pickupCoord, setPickupCoord] = useState<LatLngObj | null>(null);
	const [destCoord, setDestCoord] = useState<LatLngObj | null>(null);
	const [userCoord, setUserCoord] = useState<LatLngObj | null>(null);
	const [view, setView] = useState<ViewType>("ride");

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

	const leafletMapRef = useRef<L.Map | null>(null);

	return (
		<div className="w-screen h-screen max-w-screen max-h-screen overflow-hidden relative">
			<RidePageTop view={view} setView={setView} />

			<RideSteps
				view={view}
				step={step}
				destCoord={destCoord}
				drivers={drivers}
				leafletMapRef={leafletMapRef}
				pickupCoord={pickupCoord}
				refMap={refMap}
				setDestCoord={setDestCoord}
				seenDriverIds={seenDriverIds}
				setDrivers={setDrivers}
				setPickupCoord={setPickupCoord}
				setStep={setStep}
			/>

			<main className="w-full h-full z-10">
				<SelectionMapNoSSR
					view={view}
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
			</main>
		</div>
	);
}
