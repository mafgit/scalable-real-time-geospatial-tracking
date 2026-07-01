"use client";
import RideSteps from "@/components/RideSteps";
import RidePageTop from "@/components/RidePageTop";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useStateStore } from "@/store/useStateStore";
import socketManager from "@/managers/socketManager";

const SelectionMapNoSSR = dynamic(() => import("@/components/SelectionMap"), {
	ssr: false,
});

export default function page() {
	const setUserCoord = useStateStore((s) => s.setUserCoord);

	useEffect(() => {
		// ---------------- requesting user location --------------

		if (typeof window === "undefined" || !navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setUserCoord({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				});
			},
			(err) => alert(err.message),
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000, // accept cached if within this milliseconds old
			},
		);

		return () => {
			if (socketManager.socket.connected) {
				socketManager.socket.disconnect();
			}
		};
	}, []);

	return (
		<div className="w-screen h-screen max-w-screen max-h-screen overflow-hidden relative">
			<RidePageTop />

			<RideSteps />

			<main className="w-full h-full z-10">
				<SelectionMapNoSSR />
			</main>
		</div>
	);
}
