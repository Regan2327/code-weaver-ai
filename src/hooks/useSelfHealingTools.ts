import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  toolUsed: string;
  wasHealed: boolean;
  healingPath?: string[];
}

export function useSelfHealingTools() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ToolResult | null>(null);

  const executeTool = useCallback(
    async (
      toolName: string,
      category: string,
      params: Record<string, unknown>,
      sessionId?: string
    ): Promise<ToolResult> => {
      setIsExecuting(true);

      try {
        const { data, error } = await supabase.functions.invoke("tool-orchestrator", {
          body: {
            toolName,
            category,
            params,
            sessionId,
          },
        });

        if (error) {
          const result: ToolResult = {
            success: false,
            error: error.message,
            toolUsed: toolName,
            wasHealed: false,
          };
          setLastResult(result);
          return result;
        }

        setLastResult(data as ToolResult);
        return data as ToolResult;
      } catch (e) {
        const result: ToolResult = {
          success: false,
          error: e instanceof Error ? e.message : "Unknown error",
          toolUsed: toolName,
          wasHealed: false,
        };
        setLastResult(result);
        return result;
      } finally {
        setIsExecuting(false);
      }
    },
    []
  );

  // Convenience method for flight search with self-healing
  const searchFlights = useCallback(
    async (params: { query?: string; origin?: string; destination?: string; date?: string }) => {
      return executeTool("amadeus_flights", "travel", params, `flight-${Date.now()}`);
    },
    [executeTool]
  );

  return {
    executeTool,
    searchFlights,
    isExecuting,
    lastResult,
  };
}
