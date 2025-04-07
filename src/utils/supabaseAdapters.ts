
import { 
  PurchaseOrder, 
  Supplier, 
  Driver, 
  Truck, 
  GPSData, 
  AIInsight, 
  Staff, 
  Dispenser, 
  Shift, 
  Sale, 
  Price, 
  Incident, 
  ActivityLog, 
  Tank,
  ProductType
} from '@/types';

/**
 * Convert snake_case database fields to camelCase for frontend use
 */
export const fromSupabaseFormat = {
  purchaseOrder: (dbPO: any): PurchaseOrder => ({
    id: dbPO.id,
    supplierId: dbPO.supplier_id,
    items: [], // Items would need to be fetched separately
    status: dbPO.status,
    createdAt: new Date(dbPO.created_at),
    updatedAt: new Date(dbPO.updated_at),
    notes: dbPO.notes,
    paymentStatus: dbPO.payment_status,
    poNumber: dbPO.po_number,
    grandTotal: dbPO.grand_total,
    paymentTerm: dbPO.payment_term,
    deliveryDate: dbPO.delivery_date ? new Date(dbPO.delivery_date) : undefined,
    statusHistory: [], // Would need to be constructed separately
  }),
  
  supplier: (dbSupplier: any): Supplier => ({
    id: dbSupplier.id,
    name: dbSupplier.name,
    contactName: dbSupplier.contact_name,
    contactEmail: dbSupplier.contact_email,
    contactPhone: dbSupplier.contact_phone,
    address: dbSupplier.address,
    email: dbSupplier.email,
    contact: dbSupplier.contact,
    createdAt: dbSupplier.created_at ? new Date(dbSupplier.created_at) : undefined,
    updatedAt: dbSupplier.updated_at ? new Date(dbSupplier.updated_at) : undefined,
    supplierType: dbSupplier.supplier_type,
    depotName: dbSupplier.depot_name,
    taxId: dbSupplier.tax_id,
    accountNumber: dbSupplier.account_number,
    bankName: dbSupplier.bank_name,
    products: dbSupplier.products,
  }),
  
  driver: (dbDriver: any): Driver => ({
    id: dbDriver.id,
    name: dbDriver.name,
    licenseNumber: dbDriver.license_number,
    contactPhone: dbDriver.contact_phone,
    address: dbDriver.address,
    createdAt: dbDriver.created_at ? new Date(dbDriver.created_at) : undefined,
    updatedAt: dbDriver.updated_at ? new Date(dbDriver.updated_at) : undefined,
    currentTruckId: dbDriver.current_truck_id,
    contact: dbDriver.contact,
    isAvailable: dbDriver.is_available,
  }),
  
  truck: (dbTruck: any): Truck => ({
    id: dbTruck.id,
    plateNumber: dbTruck.plate_number,
    model: dbTruck.model,
    capacity: dbTruck.capacity,
    createdAt: dbTruck.created_at ? new Date(dbTruck.created_at) : undefined,
    updatedAt: dbTruck.updated_at ? new Date(dbTruck.updated_at) : undefined,
    driverId: dbTruck.driver_id,
    driverName: dbTruck.driver_name,
    isAvailable: dbTruck.is_available,
    hasGPS: dbTruck.has_gps,
    isGPSTagged: dbTruck.is_gps_tagged,
    gpsDeviceId: dbTruck.gps_device_id,
    lastSpeed: dbTruck.last_speed,
    lastLatitude: dbTruck.last_latitude,
    lastLongitude: dbTruck.last_longitude,
    year: dbTruck.year,
  }),
  
  tank: (dbTank: any): Tank => ({
    id: dbTank.id,
    name: dbTank.name,
    capacity: dbTank.capacity,
    productType: dbTank.product_type as ProductType,
    currentLevel: dbTank.current_level,
    lastRefillDate: dbTank.last_refill_date ? new Date(dbTank.last_refill_date) : undefined,
    nextInspectionDate: dbTank.next_inspection_date ? new Date(dbTank.next_inspection_date) : undefined,
    currentVolume: dbTank.current_volume,
    minVolume: dbTank.min_volume,
    status: dbTank.status,
    isActive: dbTank.is_active,
    connectedDispensers: dbTank.connected_dispensers || [],
  }),
  
  incident: (dbIncident: any): Incident => ({
    id: dbIncident.id,
    type: dbIncident.type,
    description: dbIncident.description,
    timestamp: dbIncident.timestamp ? new Date(dbIncident.timestamp) : new Date(),
    reportedBy: dbIncident.reported_by,
    severity: dbIncident.severity,
    status: dbIncident.status,
    resolution: dbIncident.resolution,
    location: dbIncident.location,
    staffInvolved: dbIncident.staff_involved || [],
    deliveryId: dbIncident.delivery_id,
    impact: dbIncident.impact,
    orderId: dbIncident.order_id,
    reportedAt: dbIncident.timestamp ? new Date(dbIncident.timestamp) : new Date(),
  }),
  
  // Add other entity converters as needed
};

/**
 * Convert camelCase frontend models to snake_case for database storage
 */
export const toSupabaseFormat = {
  purchaseOrder: (po: Partial<PurchaseOrder>): any => {
    const dbPO: any = {};
    
    if (po.supplierId !== undefined) dbPO.supplier_id = po.supplierId;
    if (po.status !== undefined) dbPO.status = po.status;
    if (po.notes !== undefined) dbPO.notes = po.notes;
    if (po.paymentStatus !== undefined) dbPO.payment_status = po.paymentStatus;
    if (po.poNumber !== undefined) dbPO.po_number = po.poNumber;
    if (po.grandTotal !== undefined) dbPO.grand_total = po.grandTotal;
    if (po.paymentTerm !== undefined) dbPO.payment_term = po.paymentTerm;
    if (po.deliveryDate !== undefined) dbPO.delivery_date = po.deliveryDate;
    
    return dbPO;
  },
  
  supplier: (supplier: Partial<Supplier>): any => {
    const dbSupplier: any = {};
    
    if (supplier.name !== undefined) dbSupplier.name = supplier.name;
    if (supplier.contactName !== undefined) dbSupplier.contact_name = supplier.contactName;
    if (supplier.contactEmail !== undefined) dbSupplier.contact_email = supplier.contactEmail;
    if (supplier.contactPhone !== undefined) dbSupplier.contact_phone = supplier.contactPhone;
    if (supplier.address !== undefined) dbSupplier.address = supplier.address;
    if (supplier.email !== undefined) dbSupplier.email = supplier.email;
    if (supplier.contact !== undefined) dbSupplier.contact = supplier.contact;
    if (supplier.supplierType !== undefined) dbSupplier.supplier_type = supplier.supplierType;
    if (supplier.depotName !== undefined) dbSupplier.depot_name = supplier.depotName;
    if (supplier.taxId !== undefined) dbSupplier.tax_id = supplier.taxId;
    if (supplier.accountNumber !== undefined) dbSupplier.account_number = supplier.accountNumber;
    if (supplier.bankName !== undefined) dbSupplier.bank_name = supplier.bankName;
    if (supplier.products !== undefined) dbSupplier.products = supplier.products;
    
    return dbSupplier;
  },
  
  tank: (tank: Partial<Tank>): any => {
    const dbTank: any = {};
    
    if (tank.name !== undefined) dbTank.name = tank.name;
    if (tank.capacity !== undefined) dbTank.capacity = tank.capacity;
    if (tank.productType !== undefined) dbTank.product_type = tank.productType;
    if (tank.currentLevel !== undefined) dbTank.current_level = tank.currentLevel;
    if (tank.lastRefillDate !== undefined) dbTank.last_refill_date = tank.lastRefillDate;
    if (tank.nextInspectionDate !== undefined) dbTank.next_inspection_date = tank.nextInspectionDate;
    if (tank.currentVolume !== undefined) dbTank.current_volume = tank.currentVolume;
    if (tank.minVolume !== undefined) dbTank.min_volume = tank.minVolume;
    if (tank.status !== undefined) dbTank.status = tank.status;
    if (tank.isActive !== undefined) dbTank.is_active = tank.isActive;
    if (tank.connectedDispensers !== undefined) dbTank.connected_dispensers = tank.connectedDispensers;
    
    return dbTank;
  },
  
  incident: (incident: Partial<Incident>): any => {
    const dbIncident: any = {};
    
    if (incident.type !== undefined) dbIncident.type = incident.type;
    if (incident.description !== undefined) dbIncident.description = incident.description;
    if (incident.reportedAt !== undefined) dbIncident.timestamp = incident.reportedAt;
    if (incident.reportedBy !== undefined) dbIncident.reported_by = incident.reportedBy;
    if (incident.severity !== undefined) dbIncident.severity = incident.severity;
    if (incident.status !== undefined) dbIncident.status = incident.status;
    if (incident.resolution !== undefined) dbIncident.resolution = incident.resolution;
    if (incident.location !== undefined) dbIncident.location = incident.location;
    if (incident.staffInvolved !== undefined) dbIncident.staff_involved = incident.staffInvolved;
    if (incident.deliveryId !== undefined) dbIncident.delivery_id = incident.deliveryId;
    if (incident.impact !== undefined) dbIncident.impact = incident.impact;
    if (incident.orderId !== undefined) dbIncident.order_id = incident.orderId;
    
    return dbIncident;
  },
  
  // Add other entity converters as needed
};
