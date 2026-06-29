import { Router } from "express";
import { getNearbyDrivers, getDriversInBoundingBox, hello } from "./controller.js";

const router = Router();

router.get("/", hello);

router.get("/drivers/nearby", getNearbyDrivers);
router.get("/drivers/bounding-box", getDriversInBoundingBox);

export default router;
