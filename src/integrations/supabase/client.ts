// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tvbeublfxllikjdcmhuy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2YmV1YmxmeGxsaWtqZGNtaHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODgxMjAsImV4cCI6MjA2NTA2NDEyMH0.7Xpv8umgPHQfPzrmE__ziLaYp7XBor9gs8g7fYjQ7mg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);