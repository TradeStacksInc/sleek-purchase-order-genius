
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://flwebcjoeuxoinuucdkm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd2ViY2pvZXV4b2ludXVjZGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMTE5NTYsImV4cCI6MjA1OTU4Nzk1Nn0.FtJqUQABh81mbJhMorsveRgZREYwpCpAficZ-azlfzY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
