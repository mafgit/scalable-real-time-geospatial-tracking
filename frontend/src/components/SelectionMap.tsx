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
import { DriverIdLatLng } from "@/types/DriverIdLatLng";
import { vehicleIcon } from "@/app/constants/leafletIcons";
import { useMyStore } from "@/store/useMyStore";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function SelectionMap({}: {}) {
	const _leafletMapRef = useMyStore((s) => s._leafletMapRef);
	const userCoord = useMyStore((s) => s.userCoord);
	const view = useMyStore((s) => s.view);
	const step = useMyStore((s) => s.step);
	const pickupCoord = useMyStore((s) => s.pickupCoord);
	const destCoord = useMyStore((s) => s.destCoord);
	const drivers = useMyStore((s) => s.drivers);
	const _refMap = useMyStore((s) => s._refMap);

	const shouldRenderMarkers = view === "global" || step > 1;

	return userCoord ? (
		<MapContainer
			ref={_leafletMapRef}
			center={userCoord}
			zoom={26}
			zoomControl={false}
			style={{ width: "100%", height: "100%", zIndex: 10 }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

			{view === "ride" ? (
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
				<></>
			)}

			{shouldRenderMarkers ? (
				drivers.map((d: DriverIdLatLng) => (
					<Marker
						icon={vehicleIcon}
						key={d.driverId}
						ref={(element) => {
							if (element) {
								// mounted
								_refMap.current.set(d.driverId, element);
							} else {
								// unmounted
								_refMap.current.delete(d.driverId);
							}
						}}
						position={[d.lat, d.lng]} // bug: on view change or any state change that rerenders this, position will reset to this
					>
						<Popup>Driver ID: {d.driverId}</Popup>
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
