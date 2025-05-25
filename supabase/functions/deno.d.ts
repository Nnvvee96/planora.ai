/**
 * Type declarations for Deno modules used in Supabase Edge Functions
 * This file helps TypeScript understand Deno-specific imports during local development
 */

declare module "https://deno.land/std@0.131.0/http/server.ts" {
  /**
   * Function to create an HTTP server that processes requests with the given handler
   */
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.7.1" {
  /**
   * Creates a Supabase client with the provided URL and key
   */
  export function createClient(url: string, key: string): {
    from: (table: string) => {
      select: (columns?: string) => any;
      insert: (data: any) => any;
      update: (data: any) => any;
      delete: () => any;
      eq: (column: string, value: any) => any;
      lt: (column: string, value: any) => any;
      single: () => any;
    };
    auth: {
      admin: {
        deleteUser: (userId: string) => any;
      };
    };
  };
}
