import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://caclnrsyhlhsdtfkuzih.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY2xucnN5aGxoc2R0Zmt1emloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODI2MjQsImV4cCI6MjA2NzA1ODYyNH0.aXSABOpAh0rSwI5GJqsijB9Vj4DbR_DK37hZSroDYfg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 