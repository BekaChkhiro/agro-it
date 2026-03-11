export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blogs: {
        Row: {
          author: string | null
          content_en: string | null
          content_hy: string | null
          content_ka: string | null
          content_ru: string | null
          created_at: string | null
          excerpt_en: string | null
          excerpt_hy: string | null
          excerpt_ka: string | null
          excerpt_ru: string | null
          featured_image_url: string | null
          gallery_image_urls: Json | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          meta_description_en: string | null
          meta_description_hy: string | null
          meta_description_ka: string | null
          meta_description_ru: string | null
          meta_title_en: string | null
          meta_title_hy: string | null
          meta_title_ka: string | null
          meta_title_ru: string | null
          publish_date: string | null
          slug_en: string | null
          slug_hy: string | null
          slug_ka: string | null
          slug_ru: string | null
          tags: Json | null
          title_en: string
          title_hy: string | null
          title_ka: string
          title_ru: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          content_en?: string | null
          content_hy?: string | null
          content_ka?: string | null
          content_ru?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_hy?: string | null
          excerpt_ka?: string | null
          excerpt_ru?: string | null
          featured_image_url?: string | null
          gallery_image_urls?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description_en?: string | null
          meta_description_hy?: string | null
          meta_description_ka?: string | null
          meta_description_ru?: string | null
          meta_title_en?: string | null
          meta_title_hy?: string | null
          meta_title_ka?: string | null
          meta_title_ru?: string | null
          publish_date?: string | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          tags?: Json | null
          title_en: string
          title_hy?: string | null
          title_ka: string
          title_ru?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          content_en?: string | null
          content_hy?: string | null
          content_ka?: string | null
          content_ru?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_hy?: string | null
          excerpt_ka?: string | null
          excerpt_ru?: string | null
          featured_image_url?: string | null
          gallery_image_urls?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description_en?: string | null
          meta_description_hy?: string | null
          meta_description_ka?: string | null
          meta_description_ru?: string | null
          meta_title_en?: string | null
          meta_title_hy?: string | null
          meta_title_ka?: string | null
          meta_title_ru?: string | null
          publish_date?: string | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          tags?: Json | null
          title_en?: string
          title_hy?: string | null
          title_ka?: string
          title_ru?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          banner_image_url: string | null
          created_at: string | null
          description_en: string | null
          description_hy: string | null
          description_ka: string | null
          description_ru: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_featured: boolean | null
          name_en: string
          name_hy: string | null
          name_ka: string
          name_ru: string | null
          parent_id: string | null
          path_en: string | null
          path_hy: string | null
          path_ka: string | null
          path_ru: string | null
          show_in_nav: boolean | null
          slug_en: string | null
          slug_hy: string | null
          slug_ka: string | null
          slug_ru: string | null
          updated_at: string | null
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hy?: string | null
          description_ka?: string | null
          description_ru?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          name_en: string
          name_hy?: string | null
          name_ka: string
          name_ru?: string | null
          parent_id?: string | null
          path_en?: string | null
          path_hy?: string | null
          path_ka?: string | null
          path_ru?: string | null
          show_in_nav?: boolean | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hy?: string | null
          description_ka?: string | null
          description_ru?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          name_en?: string
          name_hy?: string | null
          name_ka?: string
          name_ru?: string | null
          parent_id?: string | null
          path_en?: string | null
          path_hy?: string | null
          path_ka?: string | null
          path_ru?: string | null
          show_in_nav?: boolean | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          category: string | null
          created_at: string | null
          email: string | null
          id: string
          message: string
          name: string
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message: string
          name: string
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_info_en: string | null
          additional_info_hy: string | null
          additional_info_ka: string | null
          additional_info_ru: string | null
          category_id: string | null
          created_at: string | null
          description_en: string | null
          description_hy: string | null
          description_ka: string | null
          description_ru: string | null
          gallery_image_urls: Json | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name_en: string
          name_hy: string | null
          name_ka: string
          name_ru: string | null
          price: number | null
          related_product_ids: Json | null
          slug_en: string | null
          slug_hy: string | null
          slug_ka: string | null
          slug_ru: string | null
          specs_en: Json | null
          specs_hy: Json | null
          specs_ka: Json | null
          specs_ru: Json | null
          updated_at: string | null
          video_description_en: string | null
          video_description_hy: string | null
          video_description_ka: string | null
          video_description_ru: string | null
          video_url: string | null
        }
        Insert: {
          additional_info_en?: string | null
          additional_info_hy?: string | null
          additional_info_ka?: string | null
          additional_info_ru?: string | null
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hy?: string | null
          description_ka?: string | null
          description_ru?: string | null
          gallery_image_urls?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name_en: string
          name_hy?: string | null
          name_ka: string
          name_ru?: string | null
          price?: number | null
          related_product_ids?: Json | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          specs_en?: Json | null
          specs_hy?: Json | null
          specs_ka?: Json | null
          specs_ru?: Json | null
          updated_at?: string | null
          video_description_en?: string | null
          video_description_hy?: string | null
          video_description_ka?: string | null
          video_description_ru?: string | null
          video_url?: string | null
        }
        Update: {
          additional_info_en?: string | null
          additional_info_hy?: string | null
          additional_info_ka?: string | null
          additional_info_ru?: string | null
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hy?: string | null
          description_ka?: string | null
          description_ru?: string | null
          gallery_image_urls?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name_en?: string
          name_hy?: string | null
          name_ka?: string
          name_ru?: string | null
          price?: number | null
          related_product_ids?: Json | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          specs_en?: Json | null
          specs_hy?: Json | null
          specs_ka?: Json | null
          specs_ru?: Json | null
          updated_at?: string | null
          video_description_en?: string | null
          video_description_hy?: string | null
          video_description_ka?: string | null
          video_description_ru?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      success_stories: {
        Row: {
          content_en: string | null
          content_hy: string | null
          content_ka: string | null
          content_ru: string | null
          created_at: string | null
          customer_company: string | null
          customer_location_en: string | null
          customer_location_hy: string | null
          customer_location_ka: string | null
          customer_location_ru: string | null
          customer_name_en: string | null
          customer_name_hy: string | null
          customer_name_ka: string | null
          customer_name_ru: string | null
          customer_testimonial_en: string | null
          customer_testimonial_hy: string | null
          customer_testimonial_ka: string | null
          customer_testimonial_ru: string | null
          excerpt_en: string | null
          excerpt_hy: string | null
          excerpt_ka: string | null
          excerpt_ru: string | null
          featured_image_url: string | null
          gallery_image_urls: Json | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          meta_description_en: string | null
          meta_description_hy: string | null
          meta_description_ka: string | null
          meta_description_ru: string | null
          meta_title_en: string | null
          meta_title_hy: string | null
          meta_title_ka: string | null
          meta_title_ru: string | null
          product_ids: Json | null
          publish_date: string | null
          results_achieved: Json | null
          slug_en: string | null
          slug_hy: string | null
          slug_ka: string | null
          slug_ru: string | null
          title_en: string
          title_hy: string | null
          title_ka: string
          title_ru: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          content_en?: string | null
          content_hy?: string | null
          content_ka?: string | null
          content_ru?: string | null
          created_at?: string | null
          customer_company?: string | null
          customer_location_en?: string | null
          customer_location_hy?: string | null
          customer_location_ka?: string | null
          customer_location_ru?: string | null
          customer_name_en?: string | null
          customer_name_hy?: string | null
          customer_name_ka?: string | null
          customer_name_ru?: string | null
          customer_testimonial_en?: string | null
          customer_testimonial_hy?: string | null
          customer_testimonial_ka?: string | null
          customer_testimonial_ru?: string | null
          excerpt_en?: string | null
          excerpt_hy?: string | null
          excerpt_ka?: string | null
          excerpt_ru?: string | null
          featured_image_url?: string | null
          gallery_image_urls?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description_en?: string | null
          meta_description_hy?: string | null
          meta_description_ka?: string | null
          meta_description_ru?: string | null
          meta_title_en?: string | null
          meta_title_hy?: string | null
          meta_title_ka?: string | null
          meta_title_ru?: string | null
          product_ids?: Json | null
          publish_date?: string | null
          results_achieved?: Json | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          title_en: string
          title_hy?: string | null
          title_ka: string
          title_ru?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          content_en?: string | null
          content_hy?: string | null
          content_ka?: string | null
          content_ru?: string | null
          created_at?: string | null
          customer_company?: string | null
          customer_location_en?: string | null
          customer_location_hy?: string | null
          customer_location_ka?: string | null
          customer_location_ru?: string | null
          customer_name_en?: string | null
          customer_name_hy?: string | null
          customer_name_ka?: string | null
          customer_name_ru?: string | null
          customer_testimonial_en?: string | null
          customer_testimonial_hy?: string | null
          customer_testimonial_ka?: string | null
          customer_testimonial_ru?: string | null
          excerpt_en?: string | null
          excerpt_hy?: string | null
          excerpt_ka?: string | null
          excerpt_ru?: string | null
          featured_image_url?: string | null
          gallery_image_urls?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description_en?: string | null
          meta_description_hy?: string | null
          meta_description_ka?: string | null
          meta_description_ru?: string | null
          meta_title_en?: string | null
          meta_title_hy?: string | null
          meta_title_ka?: string | null
          meta_title_ru?: string | null
          product_ids?: Json | null
          publish_date?: string | null
          results_achieved?: Json | null
          slug_en?: string | null
          slug_hy?: string | null
          slug_ka?: string | null
          slug_ru?: string | null
          title_en?: string
          title_hy?: string | null
          title_ka?: string
          title_ru?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string | null
          display_order: number | null
          email: string | null
          id: string
          image_url: string | null
          name_en: string
          name_hy: string | null
          name_ka: string
          name_ru: string | null
          phone: string | null
          position_en: string
          position_hy: string | null
          position_ka: string
          position_ru: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          name_en: string
          name_hy?: string | null
          name_ka: string
          name_ru?: string | null
          phone?: string | null
          position_en: string
          position_hy?: string | null
          position_ka: string
          position_ru?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          name_en?: string
          name_hy?: string | null
          name_ka?: string
          name_ru?: string | null
          phone?: string | null
          position_en?: string
          position_hy?: string | null
          position_ka?: string
          position_ru?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_category_tree: {
        Args: never
        Returns: {
          description_en: string
          description_ka: string
          display_order: number
          icon: string
          id: string
          level: number
          name_en: string
          name_ka: string
          parent_id: string
          path_en: string
          path_ka: string
          show_in_nav: boolean
          slug_en: string
          slug_ka: string
        }[]
      }
      get_nav_categories: {
        Args: never
        Returns: {
          display_order: number
          icon: string
          id: string
          name_en: string
          name_ka: string
          path_en: string
          path_ka: string
          slug_en: string
          slug_ka: string
        }[]
      }
      get_subcategories: {
        Args: { parent_category_id: string }
        Returns: {
          display_order: number
          icon: string
          id: string
          name_en: string
          name_ka: string
          path_en: string
          path_ka: string
          slug_en: string
          slug_ka: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
