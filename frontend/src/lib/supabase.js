import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qdbwbalfigkzeoyctkec.supabase.co";

const supabaseAnonKey = "sb_publishable_eVbInzEcx1zqOM93-bdAsA_gMrELPQF";


export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);



