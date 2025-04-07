
// Add this to the types file to ensure OffloadingDetails has correct fields
export interface OffloadingDetails {
  poId: string;
  tankId: string;
  initialTankVolume: number;
  finalTankVolume: number;
  loadedVolume: number;
  deliveredVolume: number;
  isDiscrepancyFlagged: boolean;
  discrepancyPercentage: number;
  productType: ProductType;
  measuredBy: string;
  measuredByRole: string;
  timestamp: Date;
  notes?: string;
  gpsDeviceId?: string;
}
