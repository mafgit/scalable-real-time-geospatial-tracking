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
import { RefObject, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { LatLngObj } from "@/types/LatLngObj";
import { DriverIdLatLng } from "@/types/DriverIdLatLng";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function SelectionMap({
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
	userCoord: LatLngObj;
	pickupCoord: LatLngObj;
	destCoord: LatLngObj;
	setPickupCoord: React.Dispatch<React.SetStateAction<LatLngObj>>;
	setDestCoord: React.Dispatch<React.SetStateAction<LatLngObj>>;
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
			style={{ width: "100%", height: "100%" }}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>

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
					radius={300}
				/>
			)}

			{step > 2 && pickupCoord && destCoord && (
				<Polygon positions={[pickupCoord, destCoord]} />
			)}

			{step > 1 ? (
				drivers.map((d: DriverIdLatLng) => (
					<Marker
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
						position={[24, 66]} // todo: remove fake position
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
