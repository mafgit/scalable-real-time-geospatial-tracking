"use client";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import MapClicker from "./MapClicker";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export type LatLngObj = {
	lat: number;
	lng: number;
} | null;

export default function SelectionMap({
	userCoord,
	pickupCoord,
	destCoord,
	setPickupCoord,
	setDestCoord,
	step,
}: {
	userCoord: LatLngObj;
	pickupCoord: LatLngObj;
	destCoord: LatLngObj;
	setPickupCoord: React.Dispatch<React.SetStateAction<LatLngObj>>;
	setDestCoord: React.Dispatch<React.SetStateAction<LatLngObj>>;
	step: number;
}) {
	return userCoord ? (
		<MapContainer
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
		</MapContainer>
	) : (
		<p>Error getting user location</p>
	);
}
