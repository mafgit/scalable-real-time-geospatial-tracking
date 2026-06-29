"use client";
import RideSteps from "@/components/RideSteps";
import RidePageTop from "@/components/RidePageTop";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useMyStore } from "@/store/useMyStore";

const SelectionMapNoSSR = dynamic(() => import("@/components/SelectionMap"), {
	ssr: false,
});

export default function page() {
	const requestUserCoord = useMyStore((s) => s.requestUserCoord);
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
