export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DoseEventType = "initial" | "reduction" | "increase";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          benzo_name: string;
          starting_dose: number | null;
          current_dose: number;
          taper_start_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          benzo_name: string;
          starting_dose?: number | null;
          current_dose: number;
          taper_start_date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          benzo_name?: string;
          starting_dose?: number | null;
          current_dose?: number;
          taper_start_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          dose: number | null;
          anxiety: number;
          mood: number;
          sleep_quality: number;
          sleep_hours: number;
          symptoms: string[];
          notes: string | null;
          severe_flag: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date: string;
          dose?: number | null;
          anxiety: number;
          mood: number;
          sleep_quality: number;
          sleep_hours: number;
          symptoms?: string[];
          notes?: string | null;
          severe_flag?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          dose?: number | null;
          anxiety?: number;
          mood?: number;
          sleep_quality?: number;
          sleep_hours?: number;
          symptoms?: string[];
          notes?: string | null;
          severe_flag?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      dose_events: {
        Row: {
          id: string;
          user_id: string;
          event_date: string;
          dose: number;
          event_type: DoseEventType;
          note: string | null;
          source_log_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_date: string;
          dose: number;
          event_type: DoseEventType;
          note?: string | null;
          source_log_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_date?: string;
          dose?: number;
          event_type?: DoseEventType;
          note?: string | null;
          source_log_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      dose_event_type: DoseEventType;
    };
    CompositeTypes: Record<string, never>;
  };
}
