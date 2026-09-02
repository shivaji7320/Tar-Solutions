import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase credentials for TAR Civil & Waterproofing Experts
export const SUPABASE_CONFIG = {
  projectId: process.env.SUPABASE_PROJECT_ID || 'fclidxvhvnntnbyhrmda',
  projectUrl:
    process.env.SUPABASE_URL || 'https://fclidxvhvnntnbyhrmda.supabase.co',
  anonKey:
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGlkeHZodm5udG5ieWhybWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMjAwMDAsImV4cCI6MjA1NTg5NjAwMH0.dummy_signature_token',
  tableName: process.env.SUPABASE_BOOKINGS_TABLE || 'bookings'
};

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL || SUPABASE_CONFIG.projectUrl;
    const key = process.env.SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

    if (!url || !key) {
      return null;
    }

    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    } catch (e) {
      console.warn('[SUPABASE] Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

export interface SupabaseSaveResult {
  success: boolean;
  table?: string;
  error?: string;
  code?: string;
  hint?: string;
  data?: any;
}

/**
 * Persists a new appointment record to Supabase PostgreSQL database
 */
export async function saveBookingToSupabase(booking: any): Promise<SupabaseSaveResult> {
  const client = getSupabaseClient();
  const tableName = process.env.SUPABASE_BOOKINGS_TABLE || SUPABASE_CONFIG.tableName;

  if (!client) {
    return {
      success: false,
      error: 'Supabase client credentials not configured'
    };
  }

  // Format record mapping both snake_case and camelCase to maximize PostgreSQL schema tolerance
  const recordToInsert = {
    id: booking.id || `book-${Date.now()}`,
    booking_code: booking.bookingCode || booking.booking_code,
    bookingcode: booking.bookingCode || booking.booking_code,
    customer_name: booking.customerName || booking.customer_name,
    customername: booking.customerName || booking.customer_name,
    phone: booking.phone,
    whatsapp: booking.whatsapp || booking.phone,
    email: booking.email || null,
    service: booking.service,
    service_id: booking.serviceId || booking.service_id || null,
    location: booking.location,
    work_date: booking.workDate || booking.work_date,
    preferred_time: booking.preferredTime || booking.preferred_time,
    preferredtime: booking.preferredTime || booking.preferred_time,
    message: booking.message || '',
    photos: Array.isArray(booking.photos) ? booking.photos : [],
    booking_date: booking.bookingDate || booking.booking_date || new Date().toISOString().split('T')[0],
    booking_time: booking.bookingTime || booking.booking_time || new Date().toTimeString().split(' ')[0],
    status: booking.status || 'New',
    created_at: booking.createdAt || booking.created_at || new Date().toISOString()
  };

  try {
    const { data, error } = await client
      .from(tableName)
      .insert([recordToInsert])
      .select();

    if (error) {
      console.warn(`[SUPABASE INSERT ERROR] on table [${tableName}]:`, error.message);
      return {
        success: false,
        table: tableName,
        error: error.message,
        code: error.code,
        hint: error.hint || error.details
      };
    }

    console.log(`[SUPABASE INSERT SUCCESS] Booking [${booking.bookingCode}] stored in table [${tableName}]`);
    return {
      success: true,
      table: tableName,
      data
    };
  } catch (err: any) {
    console.error(`[SUPABASE EXCEPTION]`, err?.message || err);
    return {
      success: false,
      table: tableName,
      error: err?.message || 'Unknown Supabase connection error'
    };
  }
}

/**
 * Checks connection and schema availability on the connected Supabase instance
 */
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  status: string;
  message: string;
  projectId: string;
  projectUrl: string;
  tableName: string;
  pingMs?: number;
  rowCount?: number;
  error?: string;
}> {
  const projectId = process.env.SUPABASE_PROJECT_ID || SUPABASE_CONFIG.projectId;
  const projectUrl = process.env.SUPABASE_URL || SUPABASE_CONFIG.projectUrl;
  const tableName = process.env.SUPABASE_BOOKINGS_TABLE || SUPABASE_CONFIG.tableName;

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      status: 'CONFIG_MISSING',
      message: 'Supabase credentials missing in environment variables.',
      projectId,
      projectUrl,
      tableName
    };
  }

  const startTime = Date.now();
  try {
    const { data, error, count } = await client
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    const pingMs = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, it's still reachable but schema needs creation
      return {
        connected: false,
        status: 'TABLE_NOT_FOUND_OR_RLS',
        message: `Connected to Supabase endpoint, but table '${tableName}' returned: ${error.message}`,
        projectId,
        projectUrl,
        tableName,
        pingMs,
        error: error.message
      };
    }

    return {
      connected: true,
      status: 'ACTIVE_AND_SYNCHRONIZED',
      message: `Successfully connected to Supabase PostgreSQL database. Table '${tableName}' is active.`,
      projectId,
      projectUrl,
      tableName,
      pingMs,
      rowCount: count ?? (Array.isArray(data) ? data.length : 0)
    };
  } catch (e: any) {
    return {
      connected: false,
      status: 'UNREACHABLE',
      message: e?.message || 'Unable to reach Supabase project endpoint.',
      projectId,
      projectUrl,
      tableName,
      error: e?.message
    };
  }
}

/**
 * Syncs multiple bookings in a batch to Supabase
 */
export async function syncAllBookingsToSupabase(bookings: any[]): Promise<{
  total: number;
  synced: number;
  failed: number;
  results: Array<{ bookingCode: string; success: boolean; error?: string }>;
}> {
  const results: Array<{ bookingCode: string; success: boolean; error?: string }> = [];
  let synced = 0;
  let failed = 0;

  for (const booking of bookings) {
    const res = await saveBookingToSupabase(booking);
    if (res.success) {
      synced++;
      results.push({ bookingCode: booking.bookingCode || booking.id, success: true });
    } else {
      failed++;
      results.push({ bookingCode: booking.bookingCode || booking.id, success: false, error: res.error });
    }
  }

  return {
    total: bookings.length,
    synced,
    failed,
    results
  };
}

/**
 * Fetches recent bookings from Supabase table
 */
export async function fetchBookingsFromSupabase(limit = 100): Promise<{
  success: boolean;
  bookings: any[];
  count: number;
  error?: string;
}> {
  const client = getSupabaseClient();
  const tableName = process.env.SUPABASE_BOOKINGS_TABLE || SUPABASE_CONFIG.tableName;

  if (!client) {
    return { success: false, bookings: [], count: 0, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error, count } = await client
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, bookings: [], count: 0, error: error.message };
    }

    return {
      success: true,
      bookings: data || [],
      count: count || (data?.length || 0)
    };
  } catch (err: any) {
    return { success: false, bookings: [], count: 0, error: err?.message || 'Error querying Supabase' };
  }
}

/**
 * Generates ready-to-run PostgreSQL SQL DDL schema for Supabase SQL Editor
 */
export function getRecommendedSupabaseSQL(): string {
  const tableName = process.env.SUPABASE_BOOKINGS_TABLE || SUPABASE_CONFIG.tableName;

  return `-- =========================================================================
-- TAR CIVIL & WATERPROOFING EXPERTS SOLUTIONS
-- Official Supabase PostgreSQL Database Setup Script
-- Project: ${SUPABASE_CONFIG.projectId}
-- =========================================================================

-- 1. Create Bookings & Survey Requests Table
CREATE TABLE IF NOT EXISTS public.${tableName} (
    id TEXT PRIMARY KEY,
    booking_code TEXT UNIQUE,
    bookingcode TEXT,
    customer_name TEXT NOT NULL,
    customername TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    service TEXT NOT NULL,
    service_id TEXT,
    location TEXT NOT NULL,
    work_date TEXT,
    preferred_time TEXT,
    preferredtime TEXT,
    message TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    booking_date TEXT,
    booking_time TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- 3. Create Public Insertion Policy (allows website visitors to submit bookings)
DROP POLICY IF EXISTS "Allow public anonymous booking submission" ON public.${tableName};
CREATE POLICY "Allow public anonymous booking submission"
ON public.${tableName}
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- 4. Create Read Policy for Anonymous / Authenticated Admin
DROP POLICY IF EXISTS "Allow reading bookings" ON public.${tableName};
CREATE POLICY "Allow reading bookings"
ON public.${tableName}
FOR SELECT
TO public, anon, authenticated
USING (true);

-- 5. Create Update Policy for Admin Status Updates
DROP POLICY IF EXISTS "Allow updating booking status" ON public.${tableName};
CREATE POLICY "Allow updating booking status"
ON public.${tableName}
FOR UPDATE
TO public, anon, authenticated
USING (true);

-- 6. Create Indexes for High Performance Search & Filters
CREATE INDEX IF NOT EXISTS idx_${tableName}_phone ON public.${tableName} (phone);
CREATE INDEX IF NOT EXISTS idx_${tableName}_code ON public.${tableName} (booking_code);
CREATE INDEX IF NOT EXISTS idx_${tableName}_status ON public.${tableName} (status);
CREATE INDEX IF NOT EXISTS idx_${tableName}_created ON public.${tableName} (created_at DESC);

-- =========================================================================
-- Setup complete! Table '${tableName}' is ready for automated appointment sync.
-- =========================================================================`;
}
