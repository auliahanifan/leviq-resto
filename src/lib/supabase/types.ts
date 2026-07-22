export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cash_closings: {
        Row: {
          created_at: string
          id: string
          periode_mulai: string
          periode_selesai: string
          selisih: number
          total_kartu: number
          total_tunai: number
          uang_fisik: number
        }
        Insert: {
          created_at?: string
          id?: string
          periode_mulai: string
          periode_selesai: string
          selisih: number
          total_kartu?: number
          total_tunai?: number
          uang_fisik: number
        }
        Update: {
          created_at?: string
          id?: string
          periode_mulai?: string
          periode_selesai?: string
          selisih?: number
          total_kartu?: number
          total_tunai?: number
          uang_fisik?: number
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          harga: number
          id: string
          is_active: boolean
          kategori: string | null
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          harga: number
          id?: string
          is_active?: boolean
          kategori?: string | null
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          harga?: number
          id?: string
          is_active?: boolean
          kategori?: string | null
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          harga: number
          id: string
          menu_item_id: string | null
          nama: string
          order_id: string
          qty: number
          subtotal: number
        }
        Insert: {
          created_at?: string
          harga: number
          id?: string
          menu_item_id?: string | null
          nama: string
          order_id: string
          qty: number
          subtotal: number
        }
        Update: {
          created_at?: string
          harga?: number
          id?: string
          menu_item_id?: string | null
          nama?: string
          order_id?: string
          qty?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          paid_at: string | null
          payment_method: string | null
          status: string
          table_id: string
          total: number
        }
        Insert: {
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          table_id: string
          total?: number
        }
        Update: {
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          table_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: number
          pin_hash: string
          updated_at: string
        }
        Insert: {
          id?: number
          pin_hash: string
          updated_at?: string
        }
        Update: {
          id?: number
          pin_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      tables: {
        Row: {
          created_at: string
          id: string
          nama: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_pin: { Args: { new_pin: string; old_pin: string }; Returns: boolean }
      verify_pin: { Args: { input_pin: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
