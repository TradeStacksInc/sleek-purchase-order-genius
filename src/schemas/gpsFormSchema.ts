
import * as z from 'zod';

export const gpsFormSchema = z.object({
  gpsDeviceId: z.string().min(1, "GPS device ID is required"),
  latitude: z.number().optional().default(6.5244),
  longitude: z.number().optional().default(3.3792),
  speed: z.number().optional(),
  fuelLevel: z.number().optional(),
  location: z.string().optional(),
  heading: z.number().optional(),
  truckId: z.string().optional(),
});

export type GpsFormValues = z.infer<typeof gpsFormSchema>;
