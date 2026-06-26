"use client";
import RideSteps from "@/components/RideSteps";
import RidePageTop from "@/components/RidePageTop";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useMyStore } from "@/store/useMyStore";

const SelectionMapNoSSR = dynamic(() => import("@/components/SelectionMap"), {
	ssr: false,
});

export default function page() {
	const requestUserCoord = useMyStore((s) => s.requestUserCoord);
	const _seenDriverIds = useMyStore((s) => s._seenDriverIds);
	const _refMap = useMyStore((s) => s._refMap);
	const _leafletMapRef = useMyStore((s) => s._leafletMapRef);

	useEffect(() => {
		requestUserCoord();
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
