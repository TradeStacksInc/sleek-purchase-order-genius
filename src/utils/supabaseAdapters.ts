
import { PurchaseOrder, Supplier, Driver, Truck, GPSData, AIInsight, Staff, Dispenser, Shift, Sale, Incident, ActivityLog, Tank, Price, ProductType, DeliveryDetails, OrderStatus } from '@/types';

export const fromSupabaseFormat = {
  purchaseOrder: (data: any): PurchaseOrder => {
    return {
      id: data.id,
      poNumber: data.po_number,
      status: data.status as OrderStatus,
      supplier: {
        name: data.supplier_name || 'Unknown Supplier',
        id: data.supplier_id || 'unknown',
        address: data.supplier_address,
        contact: data.supplier_contact
      },
      grandTotal: data.grand_total,
      deliveryDetails: data.delivery_details,
      offloadingDetails: data.offloading_details,
      paymentStatus: data.payment_status,
      paymentTerm: data.payment_term,
      notes: data.notes,
      createdAt: data.created_at && new Date(data.created_at),
      updatedAt: data.updated_at && new Date(data.updated_at),
      items: data.items || [] // Default to empty array if no items
    };
  },
  driver: (data: any): Driver => {
    return {
      id: data.id,
      name: data.name,
      contact: data.contact,
      licenseNumber: data.license_number,
      isAvailable: data.is_available,
      createdAt: data.created_at && new Date(data.created_at),
      updatedAt: data.updated_at && new Date(data.updated_at)
    };
  },
  truck: (data: any): Truck => {
    return {
      id: data.id,
      plateNumber: data.plate_number,
      model: data.model,
      capacity: data.capacity,
      hasGPS: data.has_gps,
      isAvailable: data.is_available,
      isGPSTagged: data.is_gps_tagged,
      driverId: data.driver_id,
      gpsDeviceId: data.gps_device_id,
      lastLatitude: data.last_latitude,
      lastLongitude: data.last_longitude,
      lastSpeed: data.last_speed,
      createdAt: data.created_at && new Date(data.created_at),
      updatedAt: data.updated_at && new Date(data.updated_at)
    };
  },
  tank: (data: any): Tank => {
    return {
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      currentVolume: data.current_volume,
      productType: data.product_type as ProductType,
      minVolume: data.min_volume,
      status: data.status,
      isActive: data.is_active,
      connectedDispensers: data.connected_dispensers,
      lastRefillDate: data.last_refill_date && new Date(data.last_refill_date),
      currentLevel: data.current_level,
      nextInspectionDate: data.next_inspection_date && new Date(data.next_inspection_date)
    };
  },
  incident: (data: any): Incident => {
    return {
      id: data.id,
      type: data.type,
      description: data.description,
      severity: data.severity,
      location: data.location,
      timestamp: data.timestamp && new Date(data.timestamp),
      status: data.status,
      orderid: data.order_id,
      impact: data.impact,
      staffInvolved: data.staff_involved,
      resolution: data.resolution,
      reportedBy: data.reported_by,
      deliveryId: data.delivery_id
    };
  },
  staff: (data: any): Staff => {
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email,
      phone: data.phone,
      address: data.address,
      contactPhone: data.contact_phone,
      isActive: data.is_active,
      createdAt: data.created_at && new Date(data.created_at),
      updatedAt: data.updated_at && new Date(data.updated_at)
    };
  },
  dispenser: (data: any): Dispenser => {
    return {
      id: data.id,
      name: data.name,
      productType: data.product_type as ProductType,
      tankId: data.tank_id,
      unitPrice: data.unit_price,
      isActive: data.is_active,
      number: data.number,
      model: data.model,
      serialNumber: data.serial_number,
      flow: data.flow,
      status: data.status,
      currentShiftSales: data.current_shift_sales,
      currentShiftVolume: data.current_shift_volume,
      totalSales: data.total_sales,
      totalVolume: data.total_volume,
      totalVolumeSold: data.total_volume_sold,
      lastActivity: data.last_activity && new Date(data.last_activity),
      lastShiftReset: data.last_shift_reset && new Date(data.last_shift_reset),
      createdAt: data.created_at && new Date(data.created_at),
      updatedAt: data.updated_at && new Date(data.updated_at)
    };
  },
  shift: (data: any): Shift => {
    return {
      id: data.id,
      staffId: data.staff_id,
      startTime: data.start_time && new Date(data.start_time),
      endTime: data.end_time && new Date(data.end_time),
      staffMembers: data.staff_members,
      name: data.name,
      salesVolume: data.sales_volume,
      salesAmount: data.sales_amount,
      status: data.status
    };
  },
  sale: (data: any): Sale => {
    return {
      id: data.id,
      dispenserId: data.dispenser_id,
      shiftId: data.shift_id,
      staffId: data.staff_id,
      volume: data.volume,
      amount: data.amount,
      paymentMethod: data.payment_method,
      timestamp: data.timestamp && new Date(data.timestamp),
      dispenserNumber: data.dispenser_number,
      unitPrice: data.unit_price,
      totalAmount: data.total_amount,
      productType: data.product_type as ProductType,
      isManualEntry: data.is_manual_entry
    };
  },
  price: (data: any): Price => {
    return {
      id: data.id,
      productType: data.product_type as ProductType,
      price: data.price,
      effectiveDate: data.effective_date && new Date(data.effective_date),
      endDate: data.end_date && new Date(data.end_date),
      isActive: data.is_active,
      purchasePrice: data.purchase_price,
      sellingPrice: data.selling_price
    };
  },
  activityLog: (data: any): ActivityLog => {
    return {
      id: data.id,
      timestamp: data.timestamp && new Date(data.timestamp),
      user: data.user,
      action: data.action,
      entityType: data.entity_type,
      entityId: data.entity_id,
      details: data.details
    };
  },
  supplier: (data: any): Supplier => {
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      contact: data.contact || data.contact_phone,
      email: data.email || data.contact_email,
      contactName: data.contact_name,
      contactPhone: data.contact_phone,
      contactEmail: data.contact_email,
      taxId: data.tax_id,
      accountNumber: data.account_number,
      bankName: data.bank_name,
      products: data.products || [],
      depotName: data.depot_name,
      supplierType: data.supplier_type,
      createdAt: data.created_at && new Date(data.created_at),
      updatedAt: data.updated_at && new Date(data.updated_at)
    };
  },
};

export const toSupabaseFormat = {
  purchaseOrder: (data: Omit<PurchaseOrder, 'id'>): any => {
    return {
      po_number: data.poNumber,
      status: data.status,
      supplier_name: data.supplier?.name,
      supplier_id: data.supplier?.id,
      supplier_address: data.supplier?.address,
      supplier_contact: data.supplier?.contact,
      grand_total: data.grandTotal,
      delivery_details: data.deliveryDetails,
      offloading_details: data.offloadingDetails,
      payment_status: data.paymentStatus,
      payment_term: data.paymentTerm,
      notes: data.notes,
      items: data.items
    };
  },
  driver: (data: Omit<Driver, 'id'>): any => {
    return {
      name: data.name,
      contact: data.contact,
      license_number: data.licenseNumber,
      is_available: data.isAvailable
    };
  },
  truck: (data: Omit<Truck, 'id'>): any => {
    return {
      plate_number: data.plateNumber,
      model: data.model,
      capacity: data.capacity,
      has_gps: data.hasGPS,
      is_available: data.isAvailable,
      is_gps_tagged: data.isGPSTagged,
      driver_id: data.driverId,
      gps_device_id: data.gpsDeviceId,
      last_latitude: data.lastLatitude,
      last_longitude: data.lastLongitude,
      last_speed: data.lastSpeed
    };
  },
  tank: (data: Omit<Tank, 'id'>): any => {
    return {
      name: data.name,
      capacity: data.capacity,
      current_volume: data.currentVolume,
      product_type: data.productType,
      min_volume: data.minVolume,
      status: data.status,
      is_active: data.isActive,
      connected_dispensers: data.connectedDispensers,
      last_refill_date: data.lastRefillDate && data.lastRefillDate.toISOString(),
      current_level: data.currentLevel,
      next_inspection_date: data.nextInspectionDate && data.nextInspectionDate.toISOString()
    };
  },
  incident: (data: Omit<Incident, 'id'>): any => {
    return {
      type: data.type,
      description: data.description,
      severity: data.severity,
      location: data.location,
      timestamp: data.timestamp && data.timestamp.toISOString(),
      status: data.status,
      order_id: data.orderid,
      impact: data.impact,
      staff_involved: data.staffInvolved,
      resolution: data.resolution,
      reported_by: data.reportedBy,
      delivery_id: data.deliveryId
    };
  },
  staff: (data: Omit<Staff, 'id'>): any => {
    return {
      name: data.name,
      role: data.role,
      email: data.email,
      phone: data.phone,
      address: data.address,
      contact_phone: data.contactPhone,
      is_active: data.isActive
    };
  },
  dispenser: (data: Omit<Dispenser, 'id'>): any => {
    return {
      name: data.name,
      product_type: data.productType,
      tank_id: data.tankId,
      unit_price: data.unitPrice,
      is_active: data.isActive,
      number: data.number,
      model: data.model,
      serial_number: data.serialNumber,
      flow: data.flow,
      status: data.status,
      current_shift_sales: data.currentShiftSales,
      current_shift_volume: data.currentShiftVolume,
      total_sales: data.totalSales,
      total_volume: data.totalVolume,
      total_volume_sold: data.totalVolumeSold,
      last_activity: data.lastActivity && data.lastActivity.toISOString(),
      last_shift_reset: data.lastShiftReset && data.lastShiftReset.toISOString()
    };
  },
  shift: (data: Omit<Shift, 'id'>): any => {
    return {
      staff_id: data.staffId,
      start_time: data.startTime && data.startTime.toISOString(),
      end_time: data.endTime && data.endTime.toISOString(),
      staff_members: data.staffMembers,
      name: data.name,
      sales_volume: data.salesVolume,
      sales_amount: data.salesAmount,
      status: data.status
    };
  },
  sale: (data: Omit<Sale, 'id'>): any => {
    return {
      dispenser_id: data.dispenserId,
      shift_id: data.shiftId,
      staff_id: data.staffId,
      volume: data.volume,
      amount: data.amount,
      payment_method: data.paymentMethod,
      timestamp: data.timestamp && data.timestamp.toISOString(),
      dispenser_number: data.dispenserNumber,
      unit_price: data.unitPrice,
      total_amount: data.totalAmount,
      product_type: data.productType,
      is_manual_entry: data.isManualEntry
    };
  },
  price: (data: Omit<Price, 'id' | 'effectiveDate'>): any => {
    return {
      product_type: data.productType,
      price: data.price,
      end_date: data.endDate && data.endDate.toISOString(),
      is_active: data.isActive,
      purchase_price: data.purchasePrice,
      selling_price: data.sellingPrice
    };
  },
  activityLog: (data: Omit<ActivityLog, 'id'>): any => {
    return {
      timestamp: data.timestamp && data.timestamp.toISOString(),
      user: data.user,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      details: data.details
    };
  },
  supplier: (data: Omit<Supplier, 'id'>): any => {
    return {
      name: data.name,
      address: data.address,
      contact: data.contact,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      email: data.email,
      tax_id: data.taxId,
      account_number: data.accountNumber,
      bank_name: data.bankName,
      depot_name: data.depotName,
      supplier_type: data.supplierType,
      products: data.products
    };
  }
};
