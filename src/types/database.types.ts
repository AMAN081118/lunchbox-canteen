export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      announcements: {
        Row: {
          canteen_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          message: string;
          title: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          canteen_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          message: string;
          title: string;
          type?: string;
          updated_at?: string;
        };
        Update: {
          canteen_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          message?: string;
          title?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteen_order_summary";
            referencedColumns: ["canteen_id"];
          },
          {
            foreignKeyName: "announcements_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteens";
            referencedColumns: ["id"];
          },
        ];
      };
      canteen_owners: {
        Row: {
          canteen_id: string;
          created_at: string;
          id: string;
          owner_profile_id: string;
        };
        Insert: {
          canteen_id: string;
          created_at?: string;
          id?: string;
          owner_profile_id: string;
        };
        Update: {
          canteen_id?: string;
          created_at?: string;
          id?: string;
          owner_profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "canteen_owners_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteen_order_summary";
            referencedColumns: ["canteen_id"];
          },
          {
            foreignKeyName: "canteen_owners_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteens";
            referencedColumns: ["id"];
          },
        ];
      };
      canteens: {
        Row: {
          based_hostel_id: string;
          created_at: string;
          gst_no: string | null;
          hostels_allowed: string[] | null;
          id: string;
          is_active: boolean;
          name: string;
          total_sales: number;
        };
        Insert: {
          based_hostel_id: string;
          created_at?: string;
          gst_no?: string | null;
          hostels_allowed?: string[] | null;
          id?: string;
          is_active?: boolean;
          name: string;
          total_sales?: number;
        };
        Update: {
          based_hostel_id?: string;
          created_at?: string;
          gst_no?: string | null;
          hostels_allowed?: string[] | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          total_sales?: number;
        };
        Relationships: [
          {
            foreignKeyName: "canteens_based_hostel_id_fkey";
            columns: ["based_hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          menu_item_id: string | null;
          order_item_id: string;
          profile_id: string;
          rating: number;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          menu_item_id?: string | null;
          order_item_id: string;
          profile_id: string;
          rating: number;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          menu_item_id?: string | null;
          order_item_id?: string;
          profile_id?: string;
          rating?: number;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_menu_item_id_fkey";
            columns: ["menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
        ];
      };
      hostels: {
        Row: {
          created_at: string;
          id: string;
          is_girls: boolean;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_girls?: boolean;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_girls?: boolean;
          name?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          available: boolean;
          avg_rating: number;
          calories: number | null;
          canteen_id: string;
          category: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_path: string | null;
          max_per_order: number;
          name: string;
          prep_time_minutes: number;
          price_inr: number;
          rating_count: number;
          serving_size: string | null;
          times_ordered: number;
          veg: boolean;
        };
        Insert: {
          available?: boolean;
          avg_rating?: number;
          calories?: number | null;
          canteen_id: string;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          max_per_order?: number;
          name: string;
          prep_time_minutes?: number;
          price_inr: number;
          rating_count?: number;
          serving_size?: string | null;
          times_ordered?: number;
          veg?: boolean;
        };
        Update: {
          available?: boolean;
          avg_rating?: number;
          calories?: number | null;
          canteen_id?: string;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          max_per_order?: number;
          name?: string;
          prep_time_minutes?: number;
          price_inr?: number;
          rating_count?: number;
          serving_size?: string | null;
          times_ordered?: number;
          veg?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteen_order_summary";
            referencedColumns: ["canteen_id"];
          },
          {
            foreignKeyName: "menu_items_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteens";
            referencedColumns: ["id"];
          },
        ];
      };
      order_events: {
        Row: {
          created_at: string;
          event_by_profile_id: string | null;
          event_type: string;
          id: string;
          meta: Json | null;
          order_id: string;
        };
        Insert: {
          created_at?: string;
          event_by_profile_id?: string | null;
          event_type: string;
          id?: string;
          meta?: Json | null;
          order_id: string;
        };
        Update: {
          created_at?: string;
          event_by_profile_id?: string | null;
          event_type?: string;
          id?: string;
          meta?: Json | null;
          order_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          menu_item_id: string;
          name: string;
          order_id: string;
          quantity: number;
          total_price_inr: number;
          unit_price_inr: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          menu_item_id: string;
          name: string;
          order_id: string;
          quantity?: number;
          total_price_inr: number;
          unit_price_inr: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          menu_item_id?: string;
          name?: string;
          order_id?: string;
          quantity?: number;
          total_price_inr?: number;
          unit_price_inr?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey";
            columns: ["menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          backup_menu_item_id: string | null;
          canteen_id: string;
          id: string;
          notes: string | null;
          payment_method: string;
          payment_status: string;
          placed_at: string;
          scheduled_for: string | null;
          status: Database["public"]["Enums"]["order_status"];
          total_price_inr: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          backup_menu_item_id?: string | null;
          canteen_id: string;
          id?: string;
          notes?: string | null;
          payment_method?: string;
          payment_status?: string;
          placed_at?: string;
          scheduled_for?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          total_price_inr?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          backup_menu_item_id?: string | null;
          canteen_id?: string;
          id?: string;
          notes?: string | null;
          payment_method?: string;
          payment_status?: string;
          placed_at?: string;
          scheduled_for?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          total_price_inr?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_backup_menu_item_id_fkey";
            columns: ["backup_menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteen_order_summary";
            referencedColumns: ["canteen_id"];
          },
          {
            foreignKeyName: "orders_canteen_id_fkey";
            columns: ["canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteens";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          gender: string | null;
          hostel_id: string | null;
          id: string;
          phone: string | null;
          preferred_canteen_id: string | null;
          role: Database["public"]["Enums"]["user_role"];
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          gender?: string | null;
          hostel_id?: string | null;
          id: string;
          phone?: string | null;
          preferred_canteen_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          gender?: string | null;
          hostel_id?: string | null;
          id?: string;
          phone?: string | null;
          preferred_canteen_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [
          {
            foreignKeyName: "profiles_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_preferred_canteen_id_fkey";
            columns: ["preferred_canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteen_order_summary";
            referencedColumns: ["canteen_id"];
          },
          {
            foreignKeyName: "profiles_preferred_canteen_id_fkey";
            columns: ["preferred_canteen_id"];
            isOneToOne: false;
            referencedRelation: "canteens";
            referencedColumns: ["id"];
          },
        ];
      };
      user_carts: {
        Row: {
          items: Json;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          items?: Json;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          items?: Json;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      canteen_order_summary: {
        Row: {
          canteen_id: string | null;
          canteen_name: string | null;
          in_preparation_orders: number | null;
          pending_orders: number | null;
          ready_orders: number | null;
          total_sales: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_order: {
        Args: {
          p_canteen_id: string;
          p_items: Database["public"]["CompositeTypes"]["cart_item_input"][];
        };
        Returns: string;
      };
      get_available_canteens: {
        Args: { p_gender: string; p_hostel_id: string };
        Returns: {
          based_hostel_id: string;
          hostels_allowed: string[];
          id: string;
          is_girls: boolean;
          name: string;
        }[];
      };
      search_menu_items: {
        Args: {
          p_canteen_id: string;
          p_filters?: Json;
          p_limit?: number;
          p_query: string;
          p_sort?: string;
          p_suggest?: boolean;
        };
        Returns: {
          available: boolean;
          avg_rating: number;
          calories: number;
          category: string;
          description: string;
          id: string;
          image_path: string;
          name: string;
          prep_time_minutes: number;
          price_inr: number;
          rating_count: number;
          veg: boolean;
        }[];
      };
    };
    Enums: {
      order_status:
        | "pending"
        | "rejected"
        | "accepted"
        | "in_preparation"
        | "ready_for_pickup"
        | "completed"
        | "cancelled";
      user_role: "student" | "owner";
    };
    CompositeTypes: {
      cart_item_input: {
        menu_item_id: string | null;
        quantity: number | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "rejected",
        "accepted",
        "in_preparation",
        "ready_for_pickup",
        "completed",
        "cancelled",
      ],
      user_role: ["student", "owner"],
    },
  },
} as const;
