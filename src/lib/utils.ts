import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ohqyremvxnaepejjokaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocXlyZW12eG5hZXBlampva2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTMzMDUsImV4cCI6MjA2Njk2OTMwNX0.jxL2LH35PzyvPQ7aCS8CWW3ufgkOF2eb6_vR7m41NHU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
