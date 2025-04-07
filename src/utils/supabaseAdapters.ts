
/**
 * Helper functions to convert between application types and Supabase database types
 */
import type { 
  PurchaseOrder, Supplier, Driver, Truck, GPSData, AIInsight, 
  Staff, Dispenser, Shift, Sale, Incident, ActivityLog, Tank, 
  Price, OffloadingDetails, DeliveryDetails, OrderStatus, PaymentTerm
} from '@/types';
import type {
  DbPurchaseOrder, DbSupplier, DbDriver, DbTruck, DbGPSData,
  DbIncident, DbTank, DbDispenser, DbStaff, DbShift, DbSale,
  DbPrice, DbDeliveryDetails, DbOffloadingDetails, DbActivityLog,
  DbAIInsight
} from '@/types/supabase-custom';

export const fromSupabaseFormat = {
  // Convert from Supabase format to application format
  purchaseOrder: (dbPurchaseOrder: DbPurchaseOrder): PurchaseOrder => {
    return {
      id: dbPurchaseOrder.id,
      poNumber: dbPurchaseOrder.po_number || '',
      status: (dbPurchaseOrder.status as OrderStatus) || 'draft',
      supplier: dbPurchaseOrder.supplier_id || '',
      deliveryDate: dbPurchaseOrder.delivery_date ? new Date(dbPurchaseOrder.delivery_date) : new Date(),
      notes: dbPurchaseOrder.notes || '',
      paymentStatus: (dbPurchaseOrder.payment_status as 'pending' | 'paid' | 'partial') || 'pending',
      paymentTerm: dbPurchaseOrder.payment_term || '',
      createdAt: dbPurchaseOrder.created_at ? new Date(dbPurchaseOrder.created_at) : new Date(),
      updatedAt: dbPurchaseOrder.updated_at ? new Date(dbPurchaseOrder.updated_at) : new Date(),
      grandTotal: dbPurchaseOrder.grand_total || 0,
      items: [] // Default empty array for items
    };
  },
  
  supplier: (dbSupplier: DbSupplier): Supplier => {
    return {
      id: dbSupplier.id,
      name: dbSupplier.name,
      address: dbSupplier.address,
      contact: dbSupplier.contact || dbSupplier.contact_name || '',
      contactPhone: dbSupplier.contact_phone || '',
      contactEmail: dbSupplier.contact_email || dbSupplier.email || '',
      taxId: dbSupplier.tax_id || '',
      accountNumber: dbSupplier.account_number || '',
      bankName: dbSupplier.bank_name || '',
      products: dbSupplier.products || [],
      depotName: dbSupplier.depot_name || '',
      supplierType: (dbSupplier.supplier_type as 'Major' | 'Independent' | 'Government') || 'Independent',
      createdAt: dbSupplier.created_at ? new Date(dbSupplier.created_at) : new Date(),
      updatedAt: dbSupplier.updated_at ? new Date(dbSupplier.updated_at) : new Date()
    };
  },
  
  driver: (dbDriver: DbDriver): Driver => {
    return {
      id: dbDriver.id,
      name: dbDriver.name,
      licenseNumber: dbDriver.license_number,
      contact: dbDriver.contact || dbDriver.contact_phone || '',
      address: dbDriver.address || '',
      isAvailable: dbDriver.is_available !== false, // Default to true if undefined
      currentTruckId: dbDriver.current_truck_id || undefined,
      createdAt: dbDriver.created_at ? new Date(dbDriver.created_at) : new Date(),
      updatedAt: dbDriver.updated_at ? new Date(dbDriver.updated_at) : new Date()
    };
  },
  
  truck: (dbTruck: DbTruck): Truck => {
    return {
      id: dbTruck.id,
      plateNumber: dbTruck.plate_number,
      model: dbTruck.model,
      capacity: dbTruck.capacity,
      isAvailable: dbTruck.is_available !== false, // Default to true if undefined
      driverId: dbTruck.driver_id || undefined,
      driverName: dbTruck.driver_name || '',
      hasGPS: dbTruck.has_gps || false,
      isGPSTagged: dbTruck.is_gps_tagged || false,
      gpsDeviceId: dbTruck.gps_device_id || undefined,
      lastLatitude: dbTruck.last_latitude || 0,
      lastLongitude: dbTruck.last_longitude || 0,
      lastSpeed: dbTruck.last_speed || 0,
      year: dbTruck.year || 0,
      createdAt: dbTruck.created_at ? new Date(dbTruck.created_at) : new Date(),
      updatedAt: dbTruck.updated_at ? new Date(dbTruck.updated_at) : new Date()
    };
  },
  
  tank: (dbTank: DbTank): Tank => {
    return {
      id: dbTank.id,
      name: dbTank.name,
      capacity: dbTank.capacity,
      currentVolume: dbTank.current_volume || 0,
      minVolume: dbTank.min_volume || 0,
      productType: dbTank.product_type,
      status: (dbTank.status as 'operational' | 'maintenance' | 'offline') || 'operational',
      isActive: dbTank.is_active !== false, // Default to true if undefined
      currentLevel: dbTank.current_level || 0,
      lastRefillDate: dbTank.last_refill_date ? new Date(dbTank.last_refill_date) : undefined,
      connectedDispensers: dbTank.connected_dispensers || [],
      nextInspectionDate: dbTank.next_inspection_date ? new Date(dbTank.next_inspection_date) : undefined
    };
  },
  
  incident: (dbIncident: DbIncident): Incident => {
    return {
      id: dbIncident.id,
      type: (dbIncident.type || 'general') as 'delay' | 'mechanical' | 'accident' | 'feedback' | 'other',
      description: dbIncident.description,
      location: dbIncident.location,
      timestamp: dbIncident.timestamp ? new Date(dbIncident.timestamp) : new Date(),
      status: (dbIncident.status || 'reported') as 'open' | 'closed' | 'in_progress',
      severity: (dbIncident.severity || 'medium') as 'low' | 'medium' | 'high',
      orderId: dbIncident.order_id || undefined,
      deliveryId: dbIncident.delivery_id || undefined,
      staffInvolved: dbIncident.staff_involved || [],
      reportedBy: dbIncident.reported_by || '',
      resolution: dbIncident.resolution || '',
      impact: (dbIncident.impact || 'neutral') as 'positive' | 'negative' | 'neutral'
    };
  }
};

export const toSupabaseFormat = {
  // Convert from application format to Supabase format
  incident: (incident: Omit<Incident, 'id'>): Omit<DbIncident, 'id'> => {
    return {
      type: incident.type,
      description: incident.description,
      location: incident.location,
      timestamp: incident.timestamp?.toISOString() || new Date().toISOString(),
      status: incident.status,
      severity: incident.severity || 'medium',
      order_id: incident.orderId,
      delivery_id: incident.deliveryId,
      staff_involved: incident.staffInvolved || [],
      reported_by: incident.reportedBy || '',
      resolution: incident.resolution || '',
      impact: incident.impact || 'neutral'
    };
  },
  
  purchaseOrder: (order: Omit<PurchaseOrder, 'id'>): Omit<DbPurchaseOrder, 'id'> => {
    return {
      po_number: order.poNumber,
      status: order.status,
      supplier_id: order.supplier,
      delivery_date: order.deliveryDate?.toISOString(),
      notes: order.notes,
      payment_status: order.paymentStatus,
      payment_term: order.paymentTerm,
      created_at: order.createdAt?.toISOString(),
      updated_at: new Date().toISOString(),
      grand_total: order.grandTotal
    };
  },
  
  supplier: (supplier: Omit<Supplier, 'id'>): Omit<DbSupplier, 'id'> => {
    return {
      name: supplier.name,
      address: supplier.address,
      contact: supplier.contact,
      contact_phone: supplier.contactPhone,
      contact_email: supplier.contactEmail,
      email: supplier.contactEmail,
      tax_id: supplier.taxId,
      account_number: supplier.accountNumber,
      bank_name: supplier.bankName,
      products: supplier.products,
      depot_name: supplier.depotName,
      supplier_type: supplier.supplierType,
      created_at: supplier.createdAt?.toISOString(),
      updated_at: new Date().toISOString(),
      contact_name: supplier.contact
    };
  }
};
