/**
 * Supabase Database type definitions.
 * Generated manually from supabase/schema.sql.
 * Provides compile-time type safety for all table queries.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          timezone: string;
          avatar_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: string;
          timezone?: string;
          avatar_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          timezone?: string;
          avatar_color?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          key: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          key: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          key?: string;
          owner_id?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          type: string;
          project_id: string;
          assignee_id: string | null;
          jira_key: string | null;
          story_points: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          type?: string;
          project_id: string;
          assignee_id?: string | null;
          jira_key?: string | null;
          story_points?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          type?: string;
          project_id?: string;
          assignee_id?: string | null;
          jira_key?: string | null;
          story_points?: number | null;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          role: string;
          email: string;
          github: string | null;
          slack: string | null;
          expertise: string[];
          avatar_color: string;
          velocity: number;
          capacity: number;
          active_tasks: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          role: string;
          email: string;
          github?: string | null;
          slack?: string | null;
          expertise?: string[];
          avatar_color?: string;
          velocity?: number;
          capacity?: number;
          active_tasks?: number;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          name?: string;
          role?: string;
          email?: string;
          github?: string | null;
          slack?: string | null;
          expertise?: string[];
          avatar_color?: string;
          velocity?: number;
          capacity?: number;
          active_tasks?: number;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          access_token: string | null;
          refresh_token: string | null;
          status: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          access_token?: string | null;
          refresh_token?: string | null;
          status?: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          status?: string;
          metadata?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          attachments: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          attachments?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          role?: string;
          content?: string;
          attachments?: Record<string, unknown> | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
