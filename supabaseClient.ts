import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejjobdbywnolopistcvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqam9iZGJ5d25vbG9waXN0Y3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODc4MDYsImV4cCI6MjA4Njg2MzgwNn0.SO1AcS_ULSQUbvRjhJVu0_Ptx6Z2YhJqTJ8KMJV51pw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
