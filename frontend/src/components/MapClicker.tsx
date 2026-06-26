import { useMyStore } from "@/store/useMyStore";
import { LatLngObj } from "@/types/LatLngObj";
import { Marker, Popup, useMapEvents } from "react-leaflet";

export default function MapClicker() {
	const step = useMyStore((s) => s.step);
	const pickupCoord = useMyStore((s) => s.pickupCoord);
	const destCoord = useMyStore((s) => s.destCoord);
	const setPickupCoord = useMyStore((s) => s.setPickupCoord);
	const setDestCoord = useMyStore((s) => s.setDestCoord);

	const map = useMapEvents({
		// todo: closure of step variable might be an issue later
		click: (e) => {
			const { lat, lng } = e.latlng;
			if (step === 1) {
				if (
					!pickupCoord ||
					pickupCoord.lat !== lat ||
					pickupCoord.lng !== lng
				) {
					setPickupCoord({ lat, lng });
					// todo: trigger query to backend for redis radius
				}
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
