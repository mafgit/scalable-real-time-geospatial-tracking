import { ViewType } from "@/types/ViewType";

export default function RidePageTop({
	view,
	setView,
}: {
	view: ViewType;
	setView: React.Dispatch<React.SetStateAction<ViewType>>;
}) {
	function changeViewToGlobal() {
		if (view === "global") return;
		setView("global");
	}

	function changeViewToRide() {
		if (view === "ride") return;
		setView("ride");
	}

	return (
		<>
			<h1 className="text-md font-semibold bg-primary/85 text-white py-2 px-4 absolute left-[16px] top-[16px] rounded-lg z-20">
				Scalable Real-Time Geospatial Tracking
			</h1>

			<div className="flex absolute top-[16px] right-[16px] z-20 items-center justify-center bg-primary rounded-md overflow-hidden bg-white/85 p-0.5">
				<button
					onClick={changeViewToRide}
					className={
						"px-2 py-1 text-sm rounded-l-md " +
						(view === "ride"
							? "bg-accent text-black"
							: "opacity-90 bg-white/85 text-black")
					}
				>
					Ride View
				</button>
				<button
					onClick={changeViewToGlobal}
					className={
						"px-2 py-1 text-sm rounded-r-md " +
						(view === "global"
							? "bg-accent text-black"
							: "opacity-90 bg-white/85 text-black")
					}
				>
					Global View
				</button>
			</div>
		</>
	);
}
