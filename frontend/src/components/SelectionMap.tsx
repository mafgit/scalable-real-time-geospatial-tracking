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
import { RefObject } from "react";
import "leaflet/dist/leaflet.css";
import { LatLngObj } from "@/types/LatLngObj";
import { DriverIdLatLng } from "@/types/DriverIdLatLng";
import { vehicleIcon } from "@/app/constants/leafletIcons";
import { ViewType } from "@/types/ViewType";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function SelectionMap({
	view,
	userCoord,
	pickupCoord,
	destCoord,
	setPickupCoord,
	setDestCoord,
	step,
	refMap,
	drivers,
	leafletMapRef,
}: {
	view: ViewType;
	userCoord: LatLngObj | null;
	pickupCoord: LatLngObj | null;
	destCoord: LatLngObj | null;
	setPickupCoord: React.Dispatch<React.SetStateAction<LatLngObj | null>>;
	setDestCoord: React.Dispatch<React.SetStateAction<LatLngObj | null>>;
	step: number;
	refMap: RefObject<Map<string, L.Marker>>;
	drivers: DriverIdLatLng[];
	leafletMapRef: RefObject<L.Map | null>;
}) {
	return userCoord ? (
		<MapContainer
			ref={leafletMapRef}
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
					<MapClicker
						destCoord={destCoord}
						pickupCoord={pickupCoord}
						setDestCoord={setDestCoord}
						setPickupCoord={setPickupCoord}
						step={step}
					/>

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

			{step > 1 ? (
				drivers.map((d: DriverIdLatLng) => (
					<Marker
						icon={vehicleIcon}
						key={d.driverId}
						ref={(element) => {
							if (element) {
								// mounted
								refMap.current.set(d.driverId, element);
							} else {
								// unmounted
								refMap.current.delete(d.driverId);
							}
						}}
						position={[d.lat, d.lng]} // todo: remove fake position
					>
						<Popup>Driver ID: {d.driverId}</Popup>
					</Marker>
				))
			) : (
				<></>
			)}
		</MapContainer>
	) : (
		<p>Getting user location...</p>
	);
}
