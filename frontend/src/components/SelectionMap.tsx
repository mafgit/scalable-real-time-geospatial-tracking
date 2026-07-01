"use client";
import {
	Circle,
	MapContainer,
	Marker,
	Polygon,
	Popup,
	TileLayer,
} from "react-leaflet";
import L from "leaflet";
import MapClicker from "./MapClicker";
import "leaflet/dist/leaflet.css";
import { DriverPing } from "@/types/DriverPing";
import { vehicleIcon } from "@/app/constants/leafletIcons";
import { useStateStore } from "@/store/useStateStore";
import mapManager from "@/managers/mapManager";
import MapMover from "./MapMover";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function SelectionMap() {
	const userCoord = useStateStore((s) => s.userCoord);
	const view = useStateStore((s) => s.view);
	const step = useStateStore((s) => s.step);
	const pickupCoord = useStateStore((s) => s.pickupCoord);
	const destCoord = useStateStore((s) => s.destCoord);
	const drivers = useStateStore((s) => s.drivers);

	const shouldRenderMarkers = view === "GLOBAL" || step > 1;

	return userCoord ? (
		<MapContainer
			ref={(mapInstance) => {
				if (mapInstance) mapManager.initializeLeafletMap(mapInstance);
			}}
			center={userCoord}
			zoom={26}
			zoomControl={false}
			style={{ width: "100%", height: "100%", zIndex: 10 }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{view === "RIDE" ? (
				<>
					<MapClicker />

					{step > 1 && pickupCoord && (
						<Circle
							center={[pickupCoord.lat, pickupCoord.lng]}
							radius={1500}
						/>
					)}

					{step > 2 && pickupCoord && destCoord && (
						<Polygon
							positions={[pickupCoord, destCoord]}
							weight={4}
							dashArray={[1, 10]}
						>
							<Popup>No info</Popup>
						</Polygon>
					)}
				</>
			) : (
				<MapMover />
			)}

			{shouldRenderMarkers ? (
				drivers.map((d: DriverPing) => (
					<Marker
						icon={vehicleIcon}
						key={d.member}
						ref={(element) => {
							if (element) {
								// mounted
								mapManager.memberToMarkerRefMap.set(
									d.member,
									element,
								);
							} else {
								// unmounted
								mapManager.memberToMarkerRefMap.delete(
									d.member,
								);
							}
						}}
						position={[d.latitude, d.longitude]} // bug: on view change or any state change that rerenders this, position will reset to this
					>
						<Popup>Driver ID: {d.member}</Popup>
					</Marker>
				))
			) : (
				<></>
			)}
		</MapContainer>
	) : (
		<></>
	);
}
