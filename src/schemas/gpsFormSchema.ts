
import * as z from "zod";

export const gpsFormSchema = z.object({
  gpsDeviceId: z.string().min(1, "GPS device ID is required"),
  latitude: z.number().default(6.5244),
  longitude: z.number().default(3.3792),
});

export type GPSFormValues = z.infer<typeof gpsFormSchema>;
