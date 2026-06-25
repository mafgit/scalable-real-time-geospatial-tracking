import { socket } from "@/app/constants/socket";
import { DriverIdLatLng } from "@/types/DriverIdLatLng";
import { LatLngObj } from "@/types/LatLngObj";
import { ViewType } from "@/types/ViewType";
import { RefObject, useCallback } from "react";

export default function RideSteps({
	view,
	step,
	setStep,
	pickupCoord,
	destCoord,
	setDrivers,
	seenDriverIds,
	refMap,
	leafletMapRef,
	drivers,
	setDestCoord,
	setPickupCoord,
}: {
	view: ViewType;
	step: number;
	setStep: React.Dispatch<React.SetStateAction<number>>;
	drivers: DriverIdLatLng[];
	pickupCoord: LatLngObj | null;
	destCoord: LatLngObj | null;
	setDrivers: React.Dispatch<React.SetStateAction<DriverIdLatLng[]>>;
	seenDriverIds: RefObject<Set<string>>;
	refMap: RefObject<Map<string, L.Marker>>;
	leafletMapRef: RefObject<L.Map | null>;
	setDestCoord: React.Dispatch<React.SetStateAction<LatLngObj | null>>;
	setPickupCoord: React.Dispatch<React.SetStateAction<LatLngObj | null>>;
}) {
	const moveForwardToStep2 = useCallback(
		async (pickupCoord: LatLngObj) => {
			if (!socket.connected) socket.connect();

			// initial getting of drivers
			const res = await fetch(
				`http://localhost:5000/drivers/nearby?lat=${pickupCoord!.lat}&lng=${pickupCoord!.lng}`,
			);
			const data = await res.json();
			console.log(data);
			setDrivers(
				Object.entries(data.drivers).map((x) => ({
					...(x[1] as LatLngObj),
					driverId: x[0],
				})),
			);
			seenDriverIds.current = new Set(Object.keys(data.drivers));

			// websocket
			socket.emit("join-frontends");

			socket.on(
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
						if (seenDriverIds.current.has(key)) {
							const marker = refMap.current.get(key);

							if (marker) {
								marker.setLatLng([
									batch[key].lat,
									batch[key].lng,
								]);
							}
						} else {
							seenDriverIds.current.add(key);
							oldDrivers.push({ ...batch[key], driverId: key });
							changeState = true;
						}
					}

					if (changeState) setDrivers(oldDrivers);
				},
			);

			setStep(2);
			leafletMapRef.current?.setZoom(15);
		},
		[drivers],
	);

	function moveForwardToStep3(destCoord: LatLngObj) {
		setStep(3);
	}

	const moveBackToStep1 = useCallback(() => {
		setStep(1);
		seenDriverIds.current.clear();
		refMap.current.clear();
		setDestCoord(null);
		setDrivers([]);
		socket.emit("leave-frontends");
		socket.off("driver-ping");
	}, []);

	const moveToNextStep = useCallback(
		(step: number) => {
			if (step === 1) {
				if (pickupCoord) {
					moveForwardToStep2(pickupCoord);
				}
			} else if (step === 2) {
				if (destCoord) {
					moveForwardToStep3(destCoord);
				}
			}
		},
		[pickupCoord, destCoord, moveForwardToStep2, moveForwardToStep3],
	);

	const moveBackToStep2 = useCallback(() => {
		setStep(2);
	}, []);

	const moveToPrevStep = useCallback(
		(step: number) => {
			if (step === 3) moveBackToStep2();
			else if (step === 2) moveBackToStep1();
		},
		[moveBackToStep2, moveBackToStep1],
	);

	return (
		<div
			className={
				"z-20 absolute bottom-[16px] left-0 flex items-center justify-center w-full transform duration-300 " +
				(view === "global" ? "translate-y-30" : "translate-y-0")
			}
		>
			<div className="px-4 py-2 items-center flex gap-2 justify-between flex-wrap text-white w-[95%] bg-primary/85 rounded-md">
				<h3 className="text-md  ">
					<span className="text-sm mr-1">{step}.</span>

					{step === 1 ? (
						"Click on pick-up location"
					) : step === 2 ? (
						"Click on drop-off location"
					) : (
						<>
							Waiting...{" "}
							<span className="text-sm ml-1">
								(nothing will happen)
							</span>
						</>
					)}
				</h3>

				<div className="flex gap-1">
					<button
						className="bg-red-500 text-sm text-white px-2 py-1 rounded-md"
						disabled={step === 1}
						onClick={() => moveToPrevStep(step)}
					>
						{step < 3 ? "Back" : "Cancel"}
					</button>

					{step < 3 && (
						<button
							className="bg-accent text-sm text-black px-2 py-1 rounded-md"
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
			</div>
		</div>
	);
}
