import { useStateStore } from "@/store/useStateStore";
import { getScreenBoundingBox } from "@/utils/mapUtils";
import { useEffect, useRef } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";

export default function MapMover() {
	const moveRefTimeout = useRef<NodeJS.Timeout | null>(null);

	const map = useMapEvents({
		moveend: () => {
			// runs on moveend as well as zoomend

			if (moveRefTimeout.current) clearTimeout(moveRefTimeout.current);
			// todo: can also add comparison if new bounding box is similar so dont refetch or join/leave rooms
			moveRefTimeout.current = setTimeout(() => {
				// console.log(map.getZoom());
				// console.log(getScreenBoundingBox(map));
			}, 1500);
		},
	});

	return null;
}
