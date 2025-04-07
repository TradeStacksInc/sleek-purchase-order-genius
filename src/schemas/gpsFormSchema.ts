
import * as z from "zod";

export const gpsFormSchema = z.object({
  latitude: z.coerce.number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  
  longitude: z.coerce.number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  
  speed: z.coerce.number()
    .min(0, "Speed must be a positive number")
    .optional(),
  
  heading: z.coerce.number()
    .min(0, "Heading must be between 0 and 360")
    .max(360, "Heading must be between 0 and 360")
    .optional(),
  
  location: z.string().optional(),

  truckId: z.string().uuid("Invalid truck ID"),
  
  fuelLevel: z.coerce.number()
    .min(0, "Fuel level must be between 0 and 100")
    .max(100, "Fuel level must be between 0 and 100")
    .optional()
    .default(100),
});

export type GPSFormValues = z.infer<typeof gpsFormSchema>;

export const defaultGPSValues: Partial<GPSFormValues> = {
  speed: 0,
  heading: 0,
  location: "Unknown",
  fuelLevel: 100
};
