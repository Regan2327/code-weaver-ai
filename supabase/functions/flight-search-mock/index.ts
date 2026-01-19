import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock flight data for fallback
const mockFlights = [
  {
    id: "mock-1",
    airline: "United Airlines",
    departureTime: "08:00",
    arrivalTime: "11:30",
    duration: "3h 30m",
    price: 299,
    stops: 0,
    origin: "SFO",
    destination: "JFK",
    flightNumber: "UA123",
    aircraft: "Boeing 737",
    bookingClass: "ECONOMY",
  },
  {
    id: "mock-2",
    airline: "Delta Air Lines",
    departureTime: "10:15",
    arrivalTime: "14:00",
    duration: "3h 45m",
    price: 325,
    stops: 0,
    origin: "SFO",
    destination: "JFK",
    flightNumber: "DL456",
    aircraft: "Airbus A320",
    bookingClass: "ECONOMY",
  },
  {
    id: "mock-3",
    airline: "American Airlines",
    departureTime: "14:30",
    arrivalTime: "19:45",
    duration: "5h 15m",
    price: 249,
    stops: 1,
    origin: "SFO",
    destination: "JFK",
    flightNumber: "AA789",
    aircraft: "Boeing 757",
    bookingClass: "ECONOMY",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, origin, destination } = await req.json();
    console.log("[MockFlights] Request:", { query, origin, destination });

    // Customize mock data based on provided origin/destination
    const customizedFlights = mockFlights.map((flight, index) => ({
      ...flight,
      id: `mock-${Date.now()}-${index}`,
      origin: origin || flight.origin,
      destination: destination || flight.destination,
    }));

    // Simulate some network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("[MockFlights] Returning", customizedFlights.length, "mock flights");

    return new Response(
      JSON.stringify({
        flights: customizedFlights,
        searchParams: { origin, destination },
        source: "mock",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[MockFlights] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", flights: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
