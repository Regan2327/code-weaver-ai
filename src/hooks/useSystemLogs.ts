import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemLog {
  id: string;
  session_id: string | null;
  type: "info" | "healing" | "error" | "success";
  message: string;
  tool_name: string | null;
  backup_tool: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useSystemLogs(limit = 50) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [healingActive, setHealingActive] = useState(false);

  // Fetch initial logs
  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs((data as SystemLog[]) || []);
    } catch (e) {
      console.error("[useSystemLogs] Failed to fetch:", e);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel("system_logs_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "system_logs",
        },
        (payload) => {
          const newLog = payload.new as SystemLog;
          console.log("[useSystemLogs] New log:", newLog);

          setLogs((prev) => [newLog, ...prev].slice(0, limit));

          // Update healing state
          if (newLog.type === "healing") {
            setHealingActive(true);
          } else if (newLog.type === "success" || newLog.type === "error") {
            // Delay clearing healing state for visual effect
            setTimeout(() => setHealingActive(false), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs, limit]);

  const clearLogs = useCallback(async () => {
    try {
      // Note: This deletes ALL logs - in production you'd want more control
      await supabase.from("system_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      setLogs([]);
    } catch (e) {
      console.error("[useSystemLogs] Failed to clear:", e);
    }
  }, []);

  return {
    logs,
    isLoading,
    healingActive,
    clearLogs,
    refresh: fetchLogs,
  };
}
