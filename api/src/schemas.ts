import { z } from "zod";

const LatSchema = z.preprocess(
	(x) => (x === "" ? undefined : x),
	z.coerce.number(),
);

export const LatLngSchema = z.object({
	lat: LatSchema,
	lng: LatSchema,
});

export const BoundingBoxSchema = z.object({
	centerlat: LatSchema,
	centerlng: LatSchema,
	widthkm: z.coerce.number().positive(),
	heightkm: z.coerce.number().positive(),
});

export type BoundingBoxType = z.infer<typeof BoundingBoxSchema>;
