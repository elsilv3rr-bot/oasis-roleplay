import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xbcgzhmvbvogzsvvozrj.supabase.co";
const supabaseKey = "sb_secret_mkLat0tJ_x_2Z-_MVLGH6g_nsORMjh7";

export const supabase = createClient(supabaseUrl, supabaseKey);