import { Marker, Popup, useMapEvents } from "react-leaflet";
import { LatLngObj } from "./SelectionMap";

export default function MapClicker({
	step,
	setPickupCoord,
	pickupCoord,
	destCoord,
	setDestCoord,
}: {
	setPickupCoord: React.Dispatch<React.SetStateAction<LatLngObj>>;
	pickupCoord: LatLngObj;
	destCoord: LatLngObj;
	setDestCoord: React.Dispatch<React.SetStateAction<LatLngObj>>;
	step: number;
}) {
	const map = useMapEvents({
		click: (e) => {
			const { lat, lng } = e.latlng;
			if (step === 1) {
				setPickupCoord({ lat, lng });
			} else if (step === 2) {
				setDestCoord({ lat, lng });
			}

			map.flyTo(e.latlng, map.getZoom());
		},
	});

	return (
		<>
			{pickupCoord ? (
				<Marker position={[pickupCoord.lat, pickupCoord.lng]}>
					<Popup>Pickup</Popup>
				</Marker>
			) : (
				<></>
			)}

			{destCoord ? (
				<Marker position={[destCoord.lat, destCoord.lng]}>
					<Popup>Destination</Popup>
				</Marker>
			) : (
				<></>
			)}
		</>
	);
}
