export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          details: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          timestamp: string | null
          user_name: string
        }
        Insert: {
          action: string
          details: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          user_name: string
        }
        Update: {
          action?: string
          details?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          user_name?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          anomaly_type: string | null
          description: string
          generated_at: string | null
          id: string
          is_read: boolean | null
          related_entity_ids: string[] | null
          severity: string | null
          timestamp: string | null
          truck_id: string | null
          type: string
        }
        Insert: {
          anomaly_type?: string | null
          description: string
          generated_at?: string | null
          id?: string
          is_read?: boolean | null
          related_entity_ids?: string[] | null
          severity?: string | null
          timestamp?: string | null
          truck_id?: string | null
          type: string
        }
        Update: {
          anomaly_type?: string | null
          description?: string
          generated_at?: string | null
          id?: string
          is_read?: boolean | null
          related_entity_ids?: string[] | null
          severity?: string | null
          timestamp?: string | null
          truck_id?: string | null
          type?: string
        }
        Relationships: []
      }
      delivery_details: {
        Row: {
          actual_arrival_time: string | null
          depot_departure_time: string | null
          destination_arrival_time: string | null
          distance_covered: number | null
          driver_id: string | null
          driver_name: string | null
          expected_arrival_time: string | null
          id: string
          po_id: string | null
          status: string | null
          total_distance: number | null
          truck_id: string | null
          vehicle_details: string | null
        }
        Insert: {
          actual_arrival_time?: string | null
          depot_departure_time?: string | null
          destination_arrival_time?: string | null
          distance_covered?: number | null
          driver_id?: string | null
          driver_name?: string | null
          expected_arrival_time?: string | null
          id?: string
          po_id?: string | null
          status?: string | null
          total_distance?: number | null
          truck_id?: string | null
          vehicle_details?: string | null
        }
        Update: {
          actual_arrival_time?: string | null
          depot_departure_time?: string | null
          destination_arrival_time?: string | null
          distance_covered?: number | null
          driver_id?: string | null
          driver_name?: string | null
          expected_arrival_time?: string | null
          id?: string
          po_id?: string | null
          status?: string | null
          total_distance?: number | null
          truck_id?: string | null
          vehicle_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_details_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_details_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_details_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensers: {
        Row: {
          connected_tank_id: string | null
          created_at: string | null
          current_shift_sales: number | null
          current_shift_volume: number | null
          flow: number | null
          id: string
          is_active: boolean | null
          last_activity: string | null
          last_shift_reset: string | null
          model: string | null
          name: string
          number: string | null
          product_type: string | null
          serial_number: string | null
          status: string | null
          tank_id: string | null
          total_sales: number | null
          total_volume: number | null
          total_volume_sold: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          connected_tank_id?: string | null
          created_at?: string | null
          current_shift_sales?: number | null
          current_shift_volume?: number | null
          flow?: number | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          last_shift_reset?: string | null
          model?: string | null
          name: string
          number?: string | null
          product_type?: string | null
          serial_number?: string | null
          status?: string | null
          tank_id?: string | null
          total_sales?: number | null
          total_volume?: number | null
          total_volume_sold?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          connected_tank_id?: string | null
          created_at?: string | null
          current_shift_sales?: number | null
          current_shift_volume?: number | null
          flow?: number | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          last_shift_reset?: string | null
          model?: string | null
          name?: string
          number?: string | null
          product_type?: string | null
          serial_number?: string | null
          status?: string | null
          tank_id?: string | null
          total_sales?: number | null
          total_volume?: number | null
          total_volume_sold?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          address: string | null
          contact: string | null
          contact_phone: string | null
          created_at: string | null
          current_truck_id: string | null
          id: string
          is_available: boolean | null
          license_number: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_truck_id?: string | null
          id?: string
          is_available?: boolean | null
          license_number: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_truck_id?: string | null
          id?: string
          is_available?: boolean | null
          license_number?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gps_data: {
        Row: {
          fuel_level: number
          heading: number | null
          id: string
          latitude: number
          location: string
          longitude: number
          speed: number
          timestamp: string | null
          truck_id: string | null
        }
        Insert: {
          fuel_level: number
          heading?: number | null
          id?: string
          latitude: number
          location: string
          longitude: number
          speed: number
          timestamp?: string | null
          truck_id?: string | null
        }
        Update: {
          fuel_level?: number
          heading?: number | null
          id?: string
          latitude?: number
          location?: string
          longitude?: number
          speed?: number
          timestamp?: string | null
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gps_data_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          delivery_id: string | null
          description: string
          id: string
          impact: string | null
          location: string
          order_id: string | null
          reported_by: string | null
          resolution: string | null
          severity: string | null
          staff_involved: string[] | null
          status: string | null
          timestamp: string | null
          type: string | null
        }
        Insert: {
          delivery_id?: string | null
          description: string
          id?: string
          impact?: string | null
          location: string
          order_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          severity?: string | null
          staff_involved?: string[] | null
          status?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Update: {
          delivery_id?: string | null
          description?: string
          id?: string
          impact?: string | null
          location?: string
          order_id?: string | null
          reported_by?: string | null
          resolution?: string | null
          severity?: string | null
          staff_involved?: string[] | null
          status?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          action: string
          details: string | null
          entity_id: string | null
          entity_type: string
          id: string
          po_id: string | null
          timestamp: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          details?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          po_id?: string | null
          timestamp?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          po_id?: string | null
          timestamp?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      offloading_details: {
        Row: {
          delivered_volume: number
          discrepancy_percentage: number | null
          final_tank_volume: number
          id: string
          initial_tank_volume: number
          is_discrepancy_flagged: boolean | null
          loaded_volume: number
          measured_by: string
          measured_by_role: string
          notes: string | null
          po_id: string | null
          product_type: string | null
          tank_id: string | null
          timestamp: string | null
        }
        Insert: {
          delivered_volume: number
          discrepancy_percentage?: number | null
          final_tank_volume: number
          id?: string
          initial_tank_volume: number
          is_discrepancy_flagged?: boolean | null
          loaded_volume: number
          measured_by: string
          measured_by_role: string
          notes?: string | null
          po_id?: string | null
          product_type?: string | null
          tank_id?: string | null
          timestamp?: string | null
        }
        Update: {
          delivered_volume?: number
          discrepancy_percentage?: number | null
          final_tank_volume?: number
          id?: string
          initial_tank_volume?: number
          is_discrepancy_flagged?: boolean | null
          loaded_volume?: number
          measured_by?: string
          measured_by_role?: string
          notes?: string | null
          po_id?: string | null
          product_type?: string | null
          tank_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offloading_details_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offloading_details_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          effective_date: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          price: number
          product_type: string
          purchase_price: number | null
          selling_price: number | null
        }
        Insert: {
          effective_date?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          price: number
          product_type: string
          purchase_price?: number | null
          selling_price?: number | null
        }
        Update: {
          effective_date?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          product_type?: string
          purchase_price?: number | null
          selling_price?: number | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          po_id: string | null
          product: string | null
          product_id: string | null
          product_name: string | null
          quantity: number
          total_amount: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          po_id?: string | null
          product?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity: number
          total_amount?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          po_id?: string | null
          product?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          total_amount?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          delivery_date: string | null
          grand_total: number | null
          id: string
          notes: string | null
          payment_status: string | null
          payment_term: string | null
          po_number: string | null
          status: string
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_date?: string | null
          grand_total?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          payment_term?: string | null
          po_number?: string | null
          status: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_date?: string | null
          grand_total?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          payment_term?: string | null
          po_number?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          dispenser_id: string | null
          dispenser_number: string | null
          id: string
          is_manual_entry: boolean | null
          payment_method: string | null
          product_type: string | null
          shift_id: string | null
          staff_id: string | null
          timestamp: string | null
          total_amount: number | null
          unit_price: number | null
          volume: number
        }
        Insert: {
          amount: number
          dispenser_id?: string | null
          dispenser_number?: string | null
          id?: string
          is_manual_entry?: boolean | null
          payment_method?: string | null
          product_type?: string | null
          shift_id?: string | null
          staff_id?: string | null
          timestamp?: string | null
          total_amount?: number | null
          unit_price?: number | null
          volume: number
        }
        Update: {
          amount?: number
          dispenser_id?: string | null
          dispenser_number?: string | null
          id?: string
          is_manual_entry?: boolean | null
          payment_method?: string | null
          product_type?: string | null
          shift_id?: string | null
          staff_id?: string | null
          timestamp?: string | null
          total_amount?: number | null
          unit_price?: number | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_dispenser_id_fkey"
            columns: ["dispenser_id"]
            isOneToOne: false
            referencedRelation: "dispensers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          end_time: string | null
          id: string
          name: string | null
          sales_amount: number | null
          sales_volume: number | null
          staff_id: string | null
          staff_members: string[] | null
          start_time: string
          status: string | null
        }
        Insert: {
          end_time?: string | null
          id?: string
          name?: string | null
          sales_amount?: number | null
          sales_volume?: number | null
          staff_id?: string | null
          staff_members?: string[] | null
          start_time?: string
          status?: string | null
        }
        Update: {
          end_time?: string | null
          id?: string
          name?: string | null
          sales_amount?: number | null
          sales_volume?: number | null
          staff_id?: string | null
          staff_members?: string[] | null
          start_time?: string
          status?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          contact_phone: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          account_number: string | null
          address: string
          bank_name: string | null
          contact: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          depot_name: string | null
          email: string | null
          id: string
          name: string
          products: string[] | null
          supplier_type: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          address: string
          bank_name?: string | null
          contact?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          depot_name?: string | null
          email?: string | null
          id?: string
          name: string
          products?: string[] | null
          supplier_type?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string
          bank_name?: string | null
          contact?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          depot_name?: string | null
          email?: string | null
          id?: string
          name?: string
          products?: string[] | null
          supplier_type?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tanks: {
        Row: {
          capacity: number
          connected_dispensers: string[] | null
          current_level: number | null
          current_volume: number | null
          id: string
          is_active: boolean | null
          last_refill_date: string | null
          min_volume: number | null
          name: string
          next_inspection_date: string | null
          product_type: string
          status: string | null
        }
        Insert: {
          capacity: number
          connected_dispensers?: string[] | null
          current_level?: number | null
          current_volume?: number | null
          id?: string
          is_active?: boolean | null
          last_refill_date?: string | null
          min_volume?: number | null
          name: string
          next_inspection_date?: string | null
          product_type: string
          status?: string | null
        }
        Update: {
          capacity?: number
          connected_dispensers?: string[] | null
          current_level?: number | null
          current_volume?: number | null
          id?: string
          is_active?: boolean | null
          last_refill_date?: string | null
          min_volume?: number | null
          name?: string
          next_inspection_date?: string | null
          product_type?: string
          status?: string | null
        }
        Relationships: []
      }
      trucks: {
        Row: {
          capacity: number
          created_at: string | null
          driver_id: string | null
          driver_name: string | null
          gps_device_id: string | null
          has_gps: boolean | null
          id: string
          is_available: boolean | null
          is_gps_tagged: boolean | null
          last_latitude: number | null
          last_longitude: number | null
          last_speed: number | null
          model: string
          plate_number: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          driver_id?: string | null
          driver_name?: string | null
          gps_device_id?: string | null
          has_gps?: boolean | null
          id?: string
          is_available?: boolean | null
          is_gps_tagged?: boolean | null
          last_latitude?: number | null
          last_longitude?: number | null
          last_speed?: number | null
          model: string
          plate_number: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          driver_id?: string | null
          driver_name?: string | null
          gps_device_id?: string | null
          has_gps?: boolean | null
          id?: string
          is_available?: boolean | null
          is_gps_tagged?: boolean | null
          last_latitude?: number | null
          last_longitude?: number | null
          last_speed?: number | null
          model?: string
          plate_number?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_database: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
