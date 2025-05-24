import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://isrcfthqeftrlrdulvbd.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcmNmdGhxZWZ0cmxyZHVsdmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNDA1MzUsImV4cCI6MjA2MjcxNjUzNX0.GOWColDxy5_AJGKlW79GUtA6WqyDmivRBj3qNbYjBWs";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
