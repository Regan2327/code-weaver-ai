import { FlightOption } from "@/components/DecisionCard";

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

interface FlightSearchParams {
  query: string;
  origin?: string;
  destination?: string;
  date?: string;
}

const extractCitiesFromQuery = (query: string): { origin?: string; destination?: string } => {
  const lowerQuery = query.toLowerCase();
  let origin: string | undefined;
  let destination: string | undefined;

  // Look for "from X to Y" pattern
  const fromToMatch = lowerQuery.match(/from\s+(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)/);
  if (fromToMatch) {
    origin = findCity(fromToMatch[1]);
    destination = findCity(fromToMatch[2]);
  } else {
    // Look for "to X" pattern
    const toMatch = lowerQuery.match(/to\s+(\w+(?:\s+\w+)?)/);
    if (toMatch) {
      destination = findCity(toMatch[1]);
    }
    
    // Look for "from X" pattern
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

export const searchFlights = (params: FlightSearchParams): FlightOption[] => {
  const { query } = params;
  const { origin, destination } = extractCitiesFromQuery(query);
  
  const numFlights = Math.floor(Math.random() * 3) + 2; // 2-4 flights
  const flights: FlightOption[] = [];
  
  const usedAirlines = new Set<string>();
  
  for (let i = 0; i < numFlights; i++) {
    // Pick a unique airline
    let airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    while (usedAirlines.has(airline.name)) {
      airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    }
    usedAirlines.add(airline.name);
    
    const departureTime = generateRandomTime();
    const durationMinutes = Math.floor(Math.random() * 180) + 90; // 1.5h - 4.5h
    const arrivalTime = addMinutes(departureTime, durationMinutes);
    const stops = Math.random() > 0.6 ? 1 : 0;
    
    // Price varies based on stops and time
    const basePrice = Math.floor(Math.random() * 400) + 200;
    const stopDiscount = stops > 0 ? 0.75 : 1;
    const price = Math.floor(basePrice * stopDiscount);
    
    flights.push({
      id: `flight-${Date.now()}-${i}`,
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
  
  // Sort by price
  return flights.sort((a, b) => a.price - b.price);
};

export const isFlightQuery = (text: string): boolean => {
  const flightKeywords = [
    'flight', 'fly', 'flights', 'book', 'booking', 'travel', 
    'trip', 'ticket', 'airline', 'plane', 'airport'
  ];
  const lowerText = text.toLowerCase();
  return flightKeywords.some(keyword => lowerText.includes(keyword));
};
