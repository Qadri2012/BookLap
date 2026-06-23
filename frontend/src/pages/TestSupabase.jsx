import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function TestSupabase() {
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          sender: "user",
          message: "Halo dari React",
        },
      ]);

    console.log("DATA:", data);
    console.log("ERROR:", error);
  };

  return <h1>Testing Supabase...</h1>;
}