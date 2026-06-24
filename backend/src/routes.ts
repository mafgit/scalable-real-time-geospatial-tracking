import { Router } from "express";
import { getNearbyDrivers, hello } from "./controller.js";

const router = Router();

router.get("/", hello);

router.get("/drivers/nearby", getNearbyDrivers)

export default router;
