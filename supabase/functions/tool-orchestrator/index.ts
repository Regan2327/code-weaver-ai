import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ToolExecutionRequest {
  toolName: string;
  category: string;
  params: Record<string, unknown>;
  sessionId?: string;
}

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  toolUsed: string;
  wasHealed: boolean;
  healingPath?: string[];
}

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseKey);
}

// Log to system_logs table for War Room visibility
async function logToWarRoom(
  supabase: ReturnType<typeof getSupabaseClient>,
  sessionId: string | null,
  type: "info" | "healing" | "error" | "success",
  message: string,
  toolName?: string,
  backupTool?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await supabase.from("system_logs").insert({
      session_id: sessionId,
      type,
      message,
      tool_name: toolName,
      backup_tool: backupTool,
      metadata: metadata || {},
    });
  } catch (e) {
    console.error("[WarRoom] Failed to log:", e);
  }
}

// Execute a tool by calling its endpoint
async function executeTool(
  toolName: string,
  endpoint: string,
  params: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    console.log(`[ToolOrchestrator] Executing tool: ${toolName} via ${endpoint}`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ToolOrchestrator] Tool ${toolName} failed:`, response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    
    // Check if the tool returned an error in its response
    if (data.error && (!data.flights || data.flights.length === 0)) {
      return { success: false, error: data.error, data };
    }

    return { success: true, data };
  } catch (e) {
    console.error(`[ToolOrchestrator] Tool ${toolName} exception:`, e);
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// Find fallback tools from the registry
async function findFallbackTools(
  supabase: ReturnType<typeof getSupabaseClient>,
  category: string,
  failedTool: string
): Promise<Array<{ name: string; endpoint: string }>> {
  try {
    // First try the explicit fallback chain
    const { data: currentTool } = await supabase
      .from("tools")
      .select("fallback_tools")
      .eq("name", failedTool)
      .single();

    if (currentTool?.fallback_tools?.length) {
      const { data: fallbacks } = await supabase
        .from("tools")
        .select("name, endpoint")
        .in("name", currentTool.fallback_tools)
        .eq("is_active", true)
        .order("priority", { ascending: true });

      if (fallbacks?.length) {
        return fallbacks.map((t) => ({ name: t.name, endpoint: t.endpoint! }));
      }
    }

    // Fall back to category-based search
    const { data: categoryTools } = await supabase.rpc("match_tools", {
      query_category: category,
      failed_tool: failedTool,
      match_count: 3,
    });

    return (categoryTools || []).map((t: { name: string; endpoint: string }) => ({
      name: t.name,
      endpoint: t.endpoint,
    }));
  } catch (e) {
    console.error("[ToolOrchestrator] Failed to find fallbacks:", e);
    return [];
  }
}

// Self-healing execution with reflexion loop
async function executeWithHealing(
  supabase: ReturnType<typeof getSupabaseClient>,
  request: ToolExecutionRequest
): Promise<ToolResult> {
  const { toolName, category, params, sessionId } = request;
  const healingPath: string[] = [toolName];

  // Get the initial tool
  const { data: tool } = await supabase
    .from("tools")
    .select("*")
    .eq("name", toolName)
    .single();

  if (!tool) {
    await logToWarRoom(supabase, sessionId || null, "error", `Tool not found: ${toolName}`, toolName);
    return { success: false, error: "Tool not found", toolUsed: toolName, wasHealed: false };
  }

  await logToWarRoom(
    supabase,
    sessionId || null,
    "info",
    `Executing primary tool: ${toolName}`,
    toolName,
    undefined,
    { params }
  );

  // Try primary tool
  let result = await executeTool(toolName, tool.endpoint!, params);

  if (result.success) {
    await logToWarRoom(supabase, sessionId || null, "success", `${toolName} executed successfully`, toolName);
    return { success: true, data: result.data, toolUsed: toolName, wasHealed: false };
  }

  // Primary failed - enter healing mode
  console.log(`[ToolOrchestrator] Primary tool failed, entering healing mode...`);
  await logToWarRoom(
    supabase,
    sessionId || null,
    "healing",
    `Primary tool ${toolName} failed. Searching for backups...`,
    toolName,
    undefined,
    { error: result.error }
  );

  // Find fallback tools
  const fallbacks = await findFallbackTools(supabase, category, toolName);
  console.log(`[ToolOrchestrator] Found ${fallbacks.length} potential fallbacks`);

  for (const fallback of fallbacks) {
    healingPath.push(fallback.name);
    
    await logToWarRoom(
      supabase,
      sessionId || null,
      "healing",
      `Attempting fallback: ${fallback.name}`,
      toolName,
      fallback.name
    );

    result = await executeTool(fallback.name, fallback.endpoint, params);

    if (result.success) {
      await logToWarRoom(
        supabase,
        sessionId || null,
        "success",
        `Self-healed! ${fallback.name} succeeded after ${toolName} failed`,
        fallback.name,
        undefined,
        { healingPath }
      );
      
      return {
        success: true,
        data: result.data,
        toolUsed: fallback.name,
        wasHealed: true,
        healingPath,
      };
    }

    await logToWarRoom(
      supabase,
      sessionId || null,
      "error",
      `Fallback ${fallback.name} also failed`,
      fallback.name,
      undefined,
      { error: result.error }
    );
  }

  // All tools failed
  await logToWarRoom(
    supabase,
    sessionId || null,
    "error",
    `All tools exhausted. Could not complete task.`,
    toolName,
    undefined,
    { healingPath, finalError: result.error }
  );

  return {
    success: false,
    error: `All tools failed. Last error: ${result.error}`,
    toolUsed: healingPath[healingPath.length - 1],
    wasHealed: false,
    healingPath,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ToolExecutionRequest = await req.json();
    console.log("[ToolOrchestrator] Received request:", request);

    const supabase = getSupabaseClient();
    const result = await executeWithHealing(supabase, request);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[ToolOrchestrator] Error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
