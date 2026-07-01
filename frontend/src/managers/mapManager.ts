import { LatLngObj } from "@/types/LatLngObj";
import L from "leaflet";
import ngeohash from "ngeohash";

interface MapManagerType {
	seenDriverIds: Set<string>;
	memberToMarkerRefMap: Map<string, L.Marker>;
	leafletMap: L.Map | null;

	initializeLeafletMap: (mapInstance: L.Map) => void;
	getScreenBoundingBox: () => {
		centerLat: number;
		centerLng: number;
		widthKm: number;
		heightKm: number;
		minLat: number;
		minLng: number;
		maxLat: number;
		maxLng: number;
	};

	getRoomsAroundPickupCoord: (pickupCoord: LatLngObj) => string[];
	getRoomsInScreenBoundingBox: () => string[];
}

const mapManager: MapManagerType = {
	seenDriverIds: new Set<string>(),
	memberToMarkerRefMap: new Map(),
	leafletMap: null,

	initializeLeafletMap(mapInstance: L.Map) {
		mapManager.leafletMap = mapInstance;
	},
	getScreenBoundingBox() {
		if (!mapManager.leafletMap) throw new Error("Map not initialized yet");

		const bounds = mapManager.leafletMap.getBounds();
		const sw = bounds.getSouthWest();
		const ne = bounds.getNorthEast();
		const center = bounds.getCenter();

		const heightKm =
			mapManager.leafletMap.distance(
				{ lat: sw.lat, lng: center.lng },
				{ lat: ne.lat, lng: center.lng },
			) / 1000;
		const widthKm =
			mapManager.leafletMap.distance(
				{ lat: center.lat, lng: sw.lng },
				{ lat: center.lat, lng: ne.lng },
			) / 1000;

		return {
			// for redis
			centerLat: center.lat,
			centerLng: center.lng,
			widthKm,
			heightKm,

			// for ngeohash
			minLat: sw.lat,
			minLng: sw.lng,
			maxLat: ne.lat,
			maxLng: ne.lng,
		};
	},

	getRoomsAroundPickupCoord(pickupCoord: LatLngObj) {
		const centerHash = ngeohash.encode(pickupCoord.lat, pickupCoord.lng, 6);
		const rooms = ngeohash.neighbors(centerHash);
		return rooms;
	},

	getRoomsInScreenBoundingBox() {
		const { maxLat, maxLng, minLat, minLng } =
			mapManager.getScreenBoundingBox();

		const rooms = ngeohash.bboxes(
			minLat,
			minLng,
			maxLat,
			maxLng,
			6, // todo: try to push each driver to different precision rooms, so check about this constant
		);
		return rooms;
	},
};

export default mapManager;
