import { DriverPing } from "./DriverPing";
import { LatLngObj } from "./LatLngObj";
import { ViewType } from "./ViewType";

export interface StateStoreType {
	pickupCoord: LatLngObj | null;
	destCoord: LatLngObj | null;
	userCoord: LatLngObj | null;
	view: ViewType;
	drivers: DriverPing[];
	step: number;

	// actions
	setDrivers: (drivers: DriverPing[]) => void;
	setPickupCoord: (c: LatLngObj | null) => void;
	setDestCoord: (c: LatLngObj | null) => void;
	setUserCoord: (c: LatLngObj | null) => void;
	changeViewToGlobal: () => Promise<void>;
	changeViewToRide: () => void;
	moveBackToStep1: () => void;
	moveForwardToStep2: (pickupCoord: LatLngObj) => Promise<void>;
	moveForwardToStep3: (pickupCoord: LatLngObj) => void;
	moveToNextStep: () => void;
	moveBackToStep2: () => void;
	moveToPrevStep: () => void;
	clearSteps: () => void;
}
