import { useMyStore } from "@/store/useMyStore";

export default function RideSteps() {
	const step = useMyStore((s) => s.step);
	const view = useMyStore((s) => s.view);
	const moveToNextStep = useMyStore((s) => s.moveToNextStep);
	const moveToPrevStep = useMyStore((s) => s.moveToPrevStep);
	const pickupCoord = useMyStore((s) => s.pickupCoord);
	const destCoord = useMyStore((s) => s.destCoord);

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
						onClick={moveToPrevStep}
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
							onClick={moveToNextStep}
						>
							{step === 1 ? "Next" : "Confirm"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
