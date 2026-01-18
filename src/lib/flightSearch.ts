import { FlightOption } from "@/components/DecisionCard";

interface FlightSearchParams {
  query: string;
  origin?: string;
  destination?: string;
  date?: string;
}

interface FlightSearchResult {
  flights: FlightOption[];
  searchParams?: {
    origin: string;
    destination: string;
    date: string;
  };
  error?: string;
}

// Real Amadeus API search via edge function
export const searchFlightsAPI = async (params: FlightSearchParams): Promise<FlightSearchResult> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(params),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[FlightSearch] API error:', data.error);
      return { 
        flights: [], 
        error: data.error || 'Flight search failed' 
      };
    }

    return {
      flights: data.flights || [],
      searchParams: data.searchParams,
    };
  } catch (error) {
    console.error('[FlightSearch] Network error:', error);
    return { 
      flights: [], 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
};

// Flight keywords for query detection
const FLIGHT_KEYWORDS = [
  'flight', 'fly', 'flights', 'book', 'booking', 'travel',
  'trip', 'ticket', 'airline', 'plane', 'airport'
];

export const isFlightQuery = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return FLIGHT_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

// Mock flight search fallback for when API fails
const AIRLINES = [
  { name: "SkyNova Airlines", code: "SN" },
  { name: "Quantum Air", code: "QA" },
  { name: "NeurAir Express", code: "NE" },
  { name: "Velocity Airways", code: "VA" },
  { name: "Horizon Pacific", code: "HP" },
  { name: "Atlas Global", code: "AG" },
  { name: "Meridian Jets", code: "MJ" },
  { name: "Starlight Aviation", code: "SA" },
];

const CITIES = [
  "New York", "Los Angeles", "San Francisco", "Chicago", "Miami",
  "Seattle", "Boston", "Denver", "Austin", "Las Vegas",
  "London", "Paris", "Tokyo", "Dubai", "Singapore",
  "Sydney", "Toronto", "Berlin", "Amsterdam", "Barcelona"
];

const extractCitiesFromQuery = (query: string): { origin?: string; destination?: string } => {
  const lowerQuery = query.toLowerCase();
  let origin: string | undefined;
  let destination: string | undefined;

  const fromToMatch = lowerQuery.match(/from\s+(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)/);
  if (fromToMatch) {
    origin = findCity(fromToMatch[1]);
    destination = findCity(fromToMatch[2]);
  } else {
    const toMatch = lowerQuery.match(/to\s+(\w+(?:\s+\w+)?)/);
    if (toMatch) {
      destination = findCity(toMatch[1]);
    }
    const fromMatch = lowerQuery.match(/from\s+(\w+(?:\s+\w+)?)/);
    if (fromMatch) {
      origin = findCity(fromMatch[1]);
    }
  }

  return { origin, destination };
};

const findCity = (input: string): string | undefined => {
  const normalized = input.toLowerCase().trim();
  return CITIES.find(city =>
    city.toLowerCase().includes(normalized) ||
    normalized.includes(city.toLowerCase())
  );
};

const generateRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 12) * 5;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

// Generate mock flights as fallback
export const searchFlightsMock = (params: FlightSearchParams): FlightOption[] => {
  const { query } = params;
  const { origin, destination } = extractCitiesFromQuery(query);

  const numFlights = Math.floor(Math.random() * 3) + 2;
  const flights: FlightOption[] = [];
  const usedAirlines = new Set<string>();

  for (let i = 0; i < numFlights; i++) {
    let airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    while (usedAirlines.has(airline.name)) {
      airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    }
    usedAirlines.add(airline.name);

    const departureTime = generateRandomTime();
    const durationMinutes = Math.floor(Math.random() * 180) + 90;
    const arrivalTime = addMinutes(departureTime, durationMinutes);
    const stops = Math.random() > 0.6 ? 1 : 0;

    const basePrice = Math.floor(Math.random() * 400) + 200;
    const stopDiscount = stops > 0 ? 0.75 : 1;
    const price = Math.floor(basePrice * stopDiscount);

    flights.push({
      id: `mock-${Date.now()}-${i}`,
      airline: airline.name,
      departureTime,
      arrivalTime,
      duration: formatDuration(durationMinutes + (stops * 45)),
      price,
      stops,
      origin: origin || "Your City",
      destination: destination || "Destination",
    });
  }

  return flights.sort((a, b) => a.price - b.price);
};
